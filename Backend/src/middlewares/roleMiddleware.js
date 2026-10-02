const AppError = require('../utils/AppError');

function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401));
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(new AppError('No tienes permiso para realizar esta acción', 403));
    }
    next();
  };
}

module.exports = requireRole;