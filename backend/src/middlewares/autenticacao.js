const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    throw new AppError('Token não informado', 401);
  }

  const token = cabecalho.slice(7);

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }

  req.usuarioId = payload.id;
  next();
}

module.exports = autenticar;
