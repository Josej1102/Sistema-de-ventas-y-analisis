const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verifica la conexión apenas arranca la app, para detectar errores
// de configuración (contraseña mal puesta, contenedor apagado, etc.)
// de inmediato en vez de que fallen las peticiones en silencio.
pool.connect()
  .then((client) => {
    console.log('Conectado a PostgreSQL');
    client.release();
  })
  .catch((err) => {
    console.error('Error al conectar a PostgreSQL:', err.message);
  });

module.exports = pool;
