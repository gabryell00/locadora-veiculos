const { Prisma } = require('@prisma/client');
const AppError = require('../errors/AppError');

function tratarErros(erro, req, res, next) {
  if (erro instanceof AppError) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
    return res.status(409).json({ erro: 'Registro duplicado' });
  }

  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido' });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = tratarErros;
