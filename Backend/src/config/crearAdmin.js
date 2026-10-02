// Uso:
//   node config/crearAdmin.js "Jose" "Jaramillo" "admin@ventas.com" "unaClaveSegura123"
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function crearAdmin() {
  const [nombre, apellido, email, password] = process.argv.slice(2);

  if (!nombre || !apellido || !email || !password) {
    console.error('Uso: node config/crearAdmin.js <nombre> <apellido> <email> <password>');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO empleados (nombre, apellido, email, password_hash, rol, cargo)
       VALUES ($1, $2, $3, $4, 'admin', 'Administrador')
       RETURNING id_empleado, nombre, apellido, email, rol`,
      [nombre, apellido, email, passwordHash]
    );
    console.log('Admin creado:', result.rows[0]);
  } catch (error) {
    console.error('Error al crear el admin:', error.message);
  } finally {
    await pool.end();
  }
}

crearAdmin();
