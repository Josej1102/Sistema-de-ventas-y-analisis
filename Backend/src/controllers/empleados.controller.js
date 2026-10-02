const pool = require("../config/db");
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// crear empleado
const createEmpleado = asyncHandler(async (req, res) => {

    const { nombre, apellido, cargo, telefono, email, password, rol} = req.body;

    if(!telefono || !password || !rol){
        throw new AppError('Telefono, contraseña y rol son obligatorios', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
        INSERT INTO empleados (nombre, apellido, cargo, telefono, email, password_hash, rol)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_empleado, nombre, apellido, cargo, telefono, email, estado, fecha_contratacion, rol`,
        [nombre, apellido, cargo, telefono, email, passwordHash, rol]    
    );
    res.status(201).json(result.rows[0]);
})

//Obtener empleados
const getEmpleados = asyncHandler( async (req, res) => {

    const result = await pool.query(`
        SELECT e.id_empleado, e.nombre, e.apellido, e.cargo, e.telefono, e.email, e.estado, e.fecha_contratacion, e.rol
        FROM empleados e
        ORDER BY e.id_empleado 
        `);
        res.json(result.rows);
})

//Obtener empleados por ID
const getEmpleadoID = asyncHandler(async (req,res) => {

    const {id} = req.params;
    const result = await pool.query(`
        SELECT e.id_empleado, e.nombre, e.apellido, e.cargo, e.telefono, 
        e.email, e.estado, e.fecha_contratacion, e.rol
        FROM empleados e WHERE id_empleado = $1`, [id]);

    if (result.rows.length === 0) {
    throw new AppError('Empleado no encontrado', 404);
  }
  res.json(result.rows[0]);
})

// Eliminar empleado
const deleteEmpleado = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM empleados WHERE id_empleado = $1 AND estado = FALSE RETURNING id_empleado ',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Empleado no encontrado', 404);
  }
  res.status(204).send();
});

//Actualizar empleado
const updateEmpleado = asyncHandler( async (req,res) => {
    const { id } = req.params;
    const { nombre, apellido, cargo, telefono, email, estado, password, rol } = req.body;

    let passwordHash = null;

    if (password) {
        passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(`
        UPDATE empleados
        SET nombre = COALESCE($1, nombre),
        apellido = COALESCE($2, apellido),
        cargo = COALESCE($3, cargo),
        telefono = COALESCE($4, telefono),
        email = COALESCE($5, email),
        estado = COALESCE($6, estado),
        password_hash = COALESCE($7, password_hash),
        rol = COALESCE($8, rol)
        WHERE id_empleado = $9
        RETURNING nombre, apellido, cargo, telefono, email, estado, rol`,
        [nombre, apellido, cargo, telefono, email, estado, passwordHash, rol, id]
        );

    if (result.rows.length === 0) {
        throw new AppError('Empleado no encontrado', 404);
    }
    res.json(result.rows[0]);

});

module.exports = {
    createEmpleado,
    getEmpleados,
    getEmpleadoID,
    deleteEmpleado,
    updateEmpleado
}