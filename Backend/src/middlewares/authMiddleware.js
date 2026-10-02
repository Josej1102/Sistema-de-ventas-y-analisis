const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function authMiddleware(req, res, next){

    const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No se proporcionó un token de autenticación', 401));
  }

  const token = authHeader.split(' ')[1];

  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET) ;
    req.user = payload;
    next();
  }catch(error){
    console.log(error);
    return next(new AppError('Token inválido o expirado', 401));
  }
}

module.exports = authMiddleware;