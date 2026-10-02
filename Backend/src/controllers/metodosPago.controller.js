const pool = require("../config/db");
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');


//Obtener metodos de pago
const getMetodoPago = asyncHandler(async (req, res) => {

    const result = await pool.query(`
        SELECT id_metodo_pago, nombre, descripcion 
        FROM metodos_pago
        ORDER BY id_metodo_pago DESC 
        `);
        res.json(result.rows);
})

module.exports = {getMetodoPago}