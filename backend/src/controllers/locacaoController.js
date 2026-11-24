const locacaoService = require('../services/locacaoService');

async function registrar(req, res) {
  const locacao = await locacaoService.registrar(req.usuarioId, req.body ?? {});
  res.status(201).json(locacao);
}

async function listar(req, res) {
  const locacoes = await locacaoService.listarDoUsuario(req.usuarioId);
  res.json(locacoes);
}

async function finalizar(req, res) {
  const locacao = await locacaoService.finalizar(req.usuarioId, req.params.id);
  res.json(locacao);
}

module.exports = { registrar, listar, finalizar };
