const pool = require("../config/db");
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

//creat clientes
const createClients = asyncHandler(async (req, res, next) => {

    const { tipo_documento, numero_documento, nombre, apellido,
        telefono, email, direccion, ciudad
    } = req.body;

    if(!tipo_documento || !numero_documento || !nombre || !email || !ciudad){
        throw new AppError('tipo de documento, numero de documento, nombre, email y ciudad son obligatorios', 400);
    }

    const result = await pool.query(`
        INSERT INTO clientes (tipo_documento, numero_documento, nombre, apellido,
        telefono, email, direccion, ciudad)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [tipo_documento, numero_documento, nombre, apellido, telefono, email, direccion, ciudad]    
    );
    res.status(201).json(result.rows[0]);
})


//Ver todos los clientes
const getClients = asyncHandler( async (req, res) => {

    const result = await pool.query(`
        SELECT c.id_cliente, c.tipo_documento, c.numero_documento, c.nombre, c.apellido, c.telefono,
        c.email, c.direccion, c.ciudad, c.estado
        FROM clientes c
        ORDER BY c.id_cliente 
        `);
        res.json(result.rows);
})

//ver cliente por ID
const getClientID = asyncHandler(async (req,res) => {

    const {id} = req.params;
    const result = await pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [id]);

    if (result.rows.length === 0) {
    throw new AppError('Cliente no encontrado', 404);
  }
  res.json(result.rows[0]);
})

// Eliminar cliente
const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM clientes WHERE id_cliente = $1 AND estado = FALSE RETURNING id_cliente ',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Cliente no encontrado', 404);
  }
  res.status(204).send();
});

//Actualizar cliente
const updateCliente = asyncHandler( async (req,res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, email, direccion, ciudad, estado } = req.body;

    const result = await pool.query(`
        UPDATE clientes
        SET nombre = COALESCE($1, nombre),
        apellido = COALESCE($2, apellido),
        telefono = COALESCE($3, telefono),
        email = COALESCE($4, email),
        direccion = COALESCE($5, direccion),
        ciudad = COALESCE($6, ciudad),
        estado = COALESCE($7, estado)
        WHERE id_cliente = $8
        RETURNING *`,
        [nombre, apellido, telefono, email, direccion, ciudad, estado, id]
        );

    if (result.rows.length === 0) {
        throw new AppError('Cliente no encontrado', 404);
    }
    res.json(result.rows[0]);

});


module.exports = {
    createClients,
    getClients,
    getClientID,
    deleteClient,
    updateCliente
}