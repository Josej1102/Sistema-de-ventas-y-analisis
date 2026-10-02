const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const crearCompra = asyncHandler(async (req, res) => {

    const {
        id_proveedor,
        productos,
        impuesto = 0,
        descuento = 0
    } = req.body;

    // 1. Validaciones generales

    if (!id_proveedor) {
        throw new AppError('El proveedor es obligatorio', 400);
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        throw new AppError(
            'La compra debe contener al menos un producto',
            400
        );
    }

    if (!Number.isFinite(Number(impuesto)) || Number(impuesto) < 0) {
        throw new AppError(
            'El impuesto debe ser un número mayor o igual a cero',
            400
        );
    }

    if (!Number.isFinite(Number(descuento)) || Number(descuento) < 0) {
        throw new AppError(
            'El descuento debe ser un número mayor o igual a cero',
            400
        );
    }

    // 2. Evitar productos repetidos

    const idsProductos = productos.map(
        producto => producto.id_producto
    );

    const idsUnicos = new Set(idsProductos);

    if (idsProductos.length !== idsUnicos.size) {
        throw new AppError(
            'No puedes repetir el mismo producto dentro de una compra',
            400
        );
    }

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        // 3. Verificar proveedor

        const proveedorResult = await client.query(`
            SELECT id_proveedor
            FROM proveedores
            WHERE id_proveedor = $1
            AND estado = TRUE
        `, [id_proveedor]);

        if (proveedorResult.rows.length === 0) {
            throw new AppError(
                'El proveedor no existe o está inactivo',
                404
            );
        }

        // 4. Preparar detalles

        const detalles = [];
        let subtotalCompra = 0;

        // 5. Recorrer productos

        for (const producto of productos) {

            const {
                id_producto,
                cantidad,
                precio_unitario
            } = producto;

            if (!id_producto) {
                throw new AppError(
                    'El id del producto es obligatorio',
                    400
                );
            }

            if (
                !Number.isInteger(Number(cantidad)) ||
                Number(cantidad) <= 0
            ) {
                throw new AppError(
                    `La cantidad del producto ${id_producto} debe ser un entero mayor que cero`,
                    400
                );
            }

            if (
                !Number.isFinite(Number(precio_unitario)) ||
                Number(precio_unitario) < 0
            ) {
                throw new AppError(
                    `El precio de compra del producto ${id_producto} no es válido`,
                    400
                );
            }

            // Verificar producto

            const productoResult = await client.query(`
                SELECT id_producto, nombre, estado
                FROM productos
                WHERE id_producto = $1
                AND estado = TRUE
            `, [id_producto]);

            if (productoResult.rows.length === 0) {
                throw new AppError(
                    `El producto ${id_producto} no existe o está inactivo`,
                    404
                );
            }

            const precio = Number(precio_unitario);
            const cantidadProducto = Number(cantidad);

            const subtotal = precio * cantidadProducto;

            subtotalCompra += subtotal;

            detalles.push({
                id_producto: Number(id_producto),
                cantidad: cantidadProducto,
                precio_unitario: precio,
                subtotal
            });
        }

        // 6. Calcular total

        const impuestoCompra = Number(impuesto);
        const descuentoCompra = Number(descuento);

        const total =
            subtotalCompra +
            impuestoCompra -
            descuentoCompra;

        if (total < 0) {
            throw new AppError(
                'El total de la compra no puede ser negativo',
                400
            );
        }

        // 7. Crear compra

        const compraResult = await client.query(`
            INSERT INTO compras (
                id_proveedor,
                id_empleado,
                subtotal,
                impuesto,
                descuento,
                total
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            id_proveedor,
            req.user.id_empleado,
            subtotalCompra,
            impuestoCompra,
            descuentoCompra,
            total
        ]);

        const compra = compraResult.rows[0];

        // 8. Crear detalles y actualizar stock

        for (const detalle of detalles) {

            await client.query(`
                INSERT INTO detalle_compras (
                    id_compra,
                    id_producto,
                    cantidad,
                    precio_unitario,
                    descuento,
                    subtotal
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                compra.id_compra,
                detalle.id_producto,
                detalle.cantidad,
                detalle.precio_unitario,
                0,
                detalle.subtotal
            ]);

            // Aumentar stock y actualizar precio de compra

            await client.query(`
                UPDATE productos
                SET stock = stock + $1,
                    precio_compra = $2
                WHERE id_producto = $3
            `, [
                detalle.cantidad,
                detalle.precio_unitario,
                detalle.id_producto
            ]);
        }

        // 9. Crear o actualizar relación producto-proveedor

        for (const detalle of detalles) {

            await client.query(`
                INSERT INTO producto_proveedor (
                    id_producto,
                    id_proveedor,
                    precio_compra,
                    es_proveedor_principal
                )
                VALUES ($1, $2, $3, FALSE)

                ON CONFLICT (id_producto, id_proveedor)
                DO UPDATE SET
                    precio_compra = EXCLUDED.precio_compra
            `, [
                detalle.id_producto,
                id_proveedor,
                detalle.precio_unitario
            ]);
        }

        // 10. Confirmar transacción

        await client.query('COMMIT');

        res.status(201).json({
            mensaje: 'Compra creada correctamente',
            compra: compra
        });

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
});

module.exports = {
    crearCompra
};