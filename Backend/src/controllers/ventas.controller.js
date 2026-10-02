const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Crear ventas / POST '/api/ventas

const createVenta = asyncHandler( async (req, res) => {

    const { id_cliente, productos, impuesto = 0, descuento = 0, pagos = [] } = req.body;

    if (!id_cliente) {
        throw new AppError('El cliente es obligatorio', 400);
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        throw new AppError('La venta debe contener al menos un producto', 400);
    }

    if (impuesto < 0) {
        throw new AppError('El impuesto no puede ser negativo', 400);
    }

    if (descuento < 0) {
        throw new AppError('El descuento no puede ser negativo', 400);
    }

    const client = await pool.connect();

    try{
        //Inicio de transaccion
        await client.query('BEGIN');

        //verificar cliente
        const clienteResult = await client.query(`
            SELECT id_cliente
            FROM clientes
            WHERE id_cliente = $1 AND estado = TRUE
            `,[id_cliente] 
        );

        if (clienteResult.rows.length === 0) {
            throw new AppError('El cliente no existe o está inactivo', 404);
        }

        // Obtener productos y precio

        const detalles = [];

        let subtotalVenta = 0;

        for (const producto of productos){

            const {id_producto, cantidad} = producto;

            if (!id_producto || !cantidad || cantidad <= 0) {
                throw new AppError(
                    'Cada producto debe tener un id válido y una cantidad mayor a cero',
                    400
                );
            }

            // verificar producto
            const productoResult = await client.query(`
                SELECT id_producto, nombre, precio_venta, stock, estado
                FROM productos
                WHERE id_producto = $1 AND estado = TRUE    
                `,[id_producto]
            );

            if (productoResult.rows.length === 0) {
                throw new AppError(
                    `El producto ${id_producto} no existe o está inactivo`,
                    404
                );
            }

            // verificar stock
            const productDB = productoResult.rows[0]

            if(cantidad > productDB.stock){
                throw new AppError(`Stock insuficiente para la cantidad solicitadadel producto
                     ${productDB.nombre}`);
                
            }

            // calcular subtotal
            const precioUnitario = Number(productDB.precio_venta);

            const subtotal = precioUnitario * cantidad;

            subtotalVenta += subtotal;

            detalles.push({
                id_producto: productDB.id_producto,
                cantidad,
                precio_unitario: precioUnitario,
                subtotal
            })
        }

        // calcular total

        const total = subtotalVenta + Number(impuesto) - Number(descuento)

        if (total < 0) {
            throw new AppError(
                'El total de la venta no puede ser negativo',
                400
            );
        }

        const totalPagado = pagos.reduce(
            (suma, pago) => suma + Number(pago.monto),
            0
        );

        if (totalPagado > total) {
        throw new AppError(
            'El total de los pagos no puede superar el total de la venta', 400);
        }

        const idEstadoVenta = totalPagado === total ? 2 : 1;

        // creacion de venta 
        const ventaResult = await client.query(`
            INSERT INTO ventas (id_cliente, id_empleado, id_estado_venta, subtotal, impuesto, descuento, total)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `, [id_cliente, req.user.id_empleado, idEstadoVenta, subtotalVenta, impuesto, descuento, total]
        )

        // creacion de detalle de venta
        const venta = ventaResult.rows[0];

        for (const detalle of detalles){

            const detalleVentaResult = await client.query(`
            INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal)
            VALUES ($1, $2, $3, $4, $5, $6)
            `, [venta.id_venta, detalle.id_producto, detalle.cantidad, detalle.precio_unitario, descuento, detalle.subtotal ]
            )
            
            //Actualizar stock
            await client.query(
                `
                UPDATE productos
                SET stock = stock - $1
                WHERE id_producto = $2
                `,[detalle.cantidad, detalle.id_producto]
            );
        }

        // Registrar pagos
        for (const pago of pagos) {

            if (!pago.id_metodo_pago || !pago.monto || pago.monto <= 0) {
                throw new AppError(
                    'Los datos del pago no son válidos',
                    400
                );
            }

            await client.query(`
                INSERT INTO pagos ( id_venta, id_metodo_pago, id_estado_pago, monto, referencia)
                VALUES ($1,$2,$3,$4,$5)
                `,[venta.id_venta, pago.id_metodo_pago, 1, pago.monto, pago.referencia || null]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            mensaje: 'Venta creada correctamente',
            venta: venta.id_venta
        });
        


    }catch(error){
        await client.query('ROLLBACK');

        throw error;
    } finally{
        client.release();
    }
});

const getVenta = asyncHandler(async (req, res) => {

    const result = await pool.query(`
        SELECT * FROM ventas
        `);
        res.json(result.rows);
});

//Obtener proveedor por ID
const getVentaID = asyncHandler(async (req,res) => {

    const {id} = req.params;
    const result = await pool.query('SELECT * FROM ventas WHERE id_venta = $1', [id]);

    if (result.rows.length === 0) {
    throw new AppError('Venta no encontrada', 404);
  }
  res.json(result.rows[0]);
});

//Anular venta
const anularVenta = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const ventaResult = await client.query(`
            SELECT id_venta, total, id_estado_venta
            FROM ventas
            WHERE id_venta = $1
        `, [id]);

        if (ventaResult.rows.length === 0) {
            throw new AppError('Venta no encontrada', 404);
        }

        const venta = ventaResult.rows[0];

        if (venta.id_estado_venta === 3) {
            throw new AppError('La venta ya está anulada', 400);
        }

        const ventaActualizada = await client.query(`
            UPDATE ventas
            SET id_estado_venta = 3
            WHERE id_venta = $1
            RETURNING *
        `, [id]);

        const detallesResult = await client.query(`
            SELECT id_producto, cantidad
            FROM detalle_ventas
            WHERE id_venta = $1
        `, [id]);

        for (const detalle of detallesResult.rows) {
            await client.query(`
                UPDATE productos
                SET stock = stock + $1
                WHERE id_producto = $2
            `, [detalle.cantidad, detalle.id_producto]);
        }

        await client.query(`
            UPDATE pagos
            SET id_estado_pago = 3
            WHERE id_venta = $1
            AND id_estado_pago = 1
        `, [id]);

        await client.query('COMMIT');

        res.json({
            mensaje: 'Venta anulada correctamente',
            venta: ventaActualizada.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

module.exports = {createVenta, getVenta, getVentaID, anularVenta }