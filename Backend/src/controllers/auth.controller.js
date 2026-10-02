const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');


const login = asyncHandler( async (req, res) => {

    const {email, password} = req.body;

    if (!email || !password) {
    throw new AppError('Email y contraseña son obligatorios', 400);
  }

  const clientResult = await pool.query(
    'SELECT id_empleado, nombre, apellido, email, password_hash, rol FROM empleados WHERE email = $1 AND estado = TRUE',
    [email]
  );

  const empleado = clientResult.rows[0];

  if (!empleado || !empleado.password_hash) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const passwordValida = await bcrypt.compare(password, empleado.password_hash);
  if (!passwordValida) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = jwt.sign(
    {
      id_empleado: empleado.id_empleado,
      nombre: empleado.nombre,
      rol: empleado.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    empleado: {
      id_empleado: empleado.id_empleado,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      rol: empleado.rol,
    },
  });

});

const me = asyncHandler(async (req, res) => {
  res.json({ usuario: req.user });
});

module.exports = { login, me };