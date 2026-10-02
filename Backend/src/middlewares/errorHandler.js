
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor';

  console.error(`[${new Date().toISOString()}] ${statusCode} - ${mensaje}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({ error: mensaje });
}

module.exports = errorHandler;
