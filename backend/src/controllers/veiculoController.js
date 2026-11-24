const veiculoService = require('../services/veiculoService');

async function cadastrar(req, res) {
  const veiculo = await veiculoService.cadastrar(req.body ?? {});
  res.status(201).json(veiculo);
}

async function listar(req, res) {
  const somenteDisponiveis = req.query.disponivel === 'true';
  const veiculos = await veiculoService.listar({ somenteDisponiveis });
  res.json(veiculos);
}

module.exports = { cadastrar, listar };
