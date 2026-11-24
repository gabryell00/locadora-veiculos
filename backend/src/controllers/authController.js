const authService = require('../services/authService');

async function cadastrar(req, res) {
  const usuario = await authService.cadastrar(req.body ?? {});
  res.status(201).json(usuario);
}

async function login(req, res) {
  const resultado = await authService.login(req.body ?? {});
  res.json(resultado);
}

async function perfil(req, res) {
  const usuario = await authService.buscarPerfil(req.usuarioId);
  res.json(usuario);
}

module.exports = { cadastrar, login, perfil };
