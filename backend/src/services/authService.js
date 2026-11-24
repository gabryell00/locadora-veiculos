const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const AppError = require('../errors/AppError');

const camposPublicos = { id: true, nome: true, email: true, criadoEm: true };

async function cadastrar({ nome, email, senha }) {
  if (!nome || !email || !senha) {
    throw new AppError('Nome, e-mail e senha são obrigatórios', 400);
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new AppError('E-mail inválido', 400);
  }

  if (String(senha).length < 6) {
    throw new AppError('A senha deve ter pelo menos 6 caracteres', 400);
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });

  if (existente) {
    throw new AppError('E-mail já cadastrado', 409);
  }

  const hash = await bcrypt.hash(String(senha), 10);

  return prisma.usuario.create({
    data: { nome, email, senha: hash },
    select: camposPublicos,
  });
}

async function login({ email, senha }) {
  if (!email || !senha) {
    throw new AppError('E-mail e senha são obrigatórios', 400);
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const senhaConfere = await bcrypt.compare(String(senha), usuario.senha);

  if (!senhaConfere) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  };
}

async function buscarPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: camposPublicos,
  });

  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }

  return usuario;
}

module.exports = { cadastrar, login, buscarPerfil };
