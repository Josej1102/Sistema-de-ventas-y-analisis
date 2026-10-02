const pool = require("../config/db");
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

//Registrar pago a venta ya iniciada
const createPago = asyncHandler(async (req, res) => {

    const {id_venta, id_metodo_pago, monto, referencia} = req.body;

    if (!id_venta || !id_metodo_pago || !monto || monto <= 0) {
        throw new AppError(
            'Venta, método de pago y un monto mayor a cero son obligatorios',
            400
        );
    }

    const client = await pool.connect();

    try{

        await client.query('BEGIN');

        const ventaResult = await client.query(`
            SELECT id_venta, total, id_estado_venta 
            FROM ventas 
            WHERE id_venta = $1 AND id_estado_venta = 1;
            `,[id_venta]);

        if (ventaResult.rows.length === 0) {
            throw new AppError('Venta no encontrada', 404);
        }

        const venta = ventaResult.rows[0];

        const pagosResult = await client.query(`
            SELECT COALESCE(SUM(monto), 0) AS total_pagado
            FROM pagos
            WHERE id_venta = $1
            AND id_estado_pago = 1
        `, [id_venta]);

        const totalPagado = Number(pagosResult.rows[0].total_pagado);

        const totalVenta = Number(venta.total);
        const montoPago = Number(monto);

        const totalPendiente = totalVenta - totalPagado

        if (montoPago > totalPendiente) {
            throw new AppError(`El pago supera el monto pendiente. Falta por pagar: ${totalPendiente}`, 400);
        }

        const pagoResult = await client.query(`
            INSERT INTO pagos (id_venta, id_metodo_pago, id_estado_pago, monto, referencia)
            VALUES ($1, $2, 1, $3, $4)
            RETURNING *
            `,[id_venta, id_metodo_pago, monto, referencia || null]);

        const nuevoTotalPagado = totalPagado + monto;

        if(nuevoTotalPagado === totalVenta){
            await client.query(`
                UPDATE ventas
                SET id_estado_venta = 2
                WHERE id_venta = $1
                `, [id_venta]);
        }

        await client.query('COMMIT');

        res.status(201).json({
            mensaje: 'Pago registrado correctamente',
            pago: pagoResult.rows[0],
            total_venta: totalVenta,
            total_pagado: nuevoTotalPagado,
            pendiente: totalVenta - nuevoTotalPagado
        });

    }catch(error){

        await client.query('ROLLBACK');
        throw error;

    }finally {

        client.release();

    }

});

//Obetener pagos
const getPagos = asyncHandler(async (req, res) => {

const result = await pool.query(`
        SELECT * FROM pagos
        `);
        res.json(result.rows);
});

//Obtener pagos por ID
const getPagosID = asyncHandler(async (req,res) => {

    const {id} = req.params;
    const result = await pool.query('SELECT * FROM pagos WHERE id_pago = $1', [id]);

    if (result.rows.length === 0) {
    throw new AppError('Pago no encontrado', 404);
  }
  res.json(result.rows[0]);
});

//Anular pago sin eliminar de la base de datos
const reembolsarPago = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const client = await pool.connect();

    try{

        await client.query('BEGIN');

        const pagoResult = await client.query(`
            SELECT id_pago, id_venta, monto, id_estado_pago
            FROM pagos
            WHERE id_pago = $1
            `, [id]);

        if (pagoResult.rows.length === 0){ 
            throw new AppError('Pago no encontrado', 404); 
        }
        
        const pago = pagoResult.rows[0]; 

        if (pago.id_estado_pago !== 1){ 
            throw new AppError( 'El pago no está en estado registrado y no puede ser reembolsado', 400 ); 
        }

        const pagoActualizado = await client.query(`
            UPDATE pagos
            SET id_estado_pago = 3
            WHERE id_pago = $1
            RETURNING *
            `,[id]);

        const ventaResult = await client.query(`
            SELECT id_venta, total, id_estado_venta
            FROM ventas
            WHERE id_venta = $1
            `,[pago.id_venta]);

        if (ventaResult.rows.length === 0) { 
            throw new AppError('Venta asociada al pago no encontrada', 404); 
        }

        const venta = ventaResult.rows[0];

        const pagosResult = await client.query(`
            SELECT COALESCE(sum(monto), 0) AS total_pagado
            FROM pagos
            WHERE id_venta = $1 AND id_estado_pago = 1
            `,[pago.id_venta]);

        const totalPagado = Number(pagosResult.rows[0].total_pagado); 
        const totalVenta = Number(venta.total);

        if(totalPagado < totalVenta && venta.id_estado_venta === 2){
            await client.query(`
                UPDATE ventas
                SET id_estado_venta = 1 
                WHERE id_venta = $1
                `, [pago.id_venta]);
        }

        await client.query('COMMIT');

        res.json({ 
            mensaje: 'Pago reembolsado correctamente', 
            pago: pagoActualizado.rows[0], 
            total_venta: totalVenta, 
            total_pagado: totalPagado, 
            pendiente: totalVenta - totalPagado }); 
        }catch(error){ 
            await client.query('ROLLBACK'); 
            throw error; 
        }finally{ 
            client.release(); 
        }
    
})

module.exports = {createPago, getPagos, getPagosID, reembolsarPago}




    
