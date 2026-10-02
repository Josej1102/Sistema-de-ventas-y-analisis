const pool = require("../config/db");
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

//crear proveedor
const createProveedor = asyncHandler(async (req, res, next) => {

    const { nombre, contacto, telefono, email, direccion} = req.body;

    if(!nombre || !email || !direccion){
        throw new AppError('nombre, email y direccion son obligatorios', 400);
    }

    const result = await pool.query(`
        INSERT INTO proveedores (nombre, contacto, telefono, email, direccion )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [nombre, contacto, telefono, email, direccion]    
    );
    res.status(201).json(result.rows[0]);
});

//Obtener proveedores
const getProveedores = asyncHandler( async (req, res) => {

    const result = await pool.query(`
        SELECT p.id_proveedor, p.nombre, p.contacto, p.telefono, p.email, p.direccion, p.estado
        FROM proveedores p
        ORDER BY p.id_proveedor 
        `);
        res.json(result.rows);
})

//Obtener proveedor por ID
const getProveedorID = asyncHandler(async (req,res) => {

    const {id} = req.params;
    const result = await pool.query('SELECT * FROM proveedores WHERE id_proveedor = $1', [id]);

    if (result.rows.length === 0) {
    throw new AppError('Proveedor no encontrado', 404);
  }
  res.json(result.rows[0]);
})

// Eliminar proveedor
const deleteProveedor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM proveedores WHERE id_proveedor = $1 RETURNING id_proveedor',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('proveedor no encontrado', 404);
  }
  res.status(204).send();
});

//Actualizar proveedor
const updateProveedor = asyncHandler( async (req,res) => {
    const { id } = req.params;
    const { nombre, contacto, telefono, email, direccion, estado } = req.body;

    const result = await pool.query(`
        UPDATE proveedores
        SET nombre = COALESCE($1, nombre),
        contacto = COALESCE($2, contacto),
        telefono = COALESCE($3, telefono),
        email = COALESCE($4, email),
        direccion = COALESCE($5, direccion),
        estado = COALESCE($6, estado)
        WHERE id_proveedor = $7
        RETURNING *`,
        [nombre, contacto, telefono, email, direccion, estado, id]
        );

    if (result.rows.length === 0) {
        throw new AppError('proveedor no encontrado', 404);
    }
    res.json(result.rows[0]);

});

module.exports = {
    createProveedor,
    getProveedores,
    getProveedorID,
    deleteProveedor,
    updateProveedor
}