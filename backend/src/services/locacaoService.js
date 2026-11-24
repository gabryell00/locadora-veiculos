const prisma = require('../prisma');
const AppError = require('../errors/AppError');

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

const dadosDoVeiculo = {
  select: { id: true, marca: true, modelo: true, placa: true, valorDiaria: true },
};

function calcularValorTotal(dataInicio, dataPrevistaDevolucao, valorDiaria) {
  const duracao = dataPrevistaDevolucao.getTime() - dataInicio.getTime();
  const diarias = Math.ceil(duracao / UM_DIA_EM_MS);
  return diarias * Number(valorDiaria);
}

async function registrar(usuarioId, { veiculoId, dataInicio, dataPrevistaDevolucao }) {
  if (!veiculoId || !dataInicio || !dataPrevistaDevolucao) {
    throw new AppError('Veículo, data de início e data prevista de devolução são obrigatórios', 400);
  }

  const idVeiculo = Number(veiculoId);
  const inicio = new Date(dataInicio);
  const prevista = new Date(dataPrevistaDevolucao);

  if (!Number.isInteger(idVeiculo)) {
    throw new AppError('Veículo inválido', 400);
  }

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(prevista.getTime())) {
    throw new AppError('Datas inválidas', 400);
  }

  if (prevista <= inicio) {
    throw new AppError('A data prevista de devolução deve ser posterior à data de início', 400);
  }

  return prisma.$transaction(async (tx) => {
    const veiculo = await tx.veiculo.findUnique({ where: { id: idVeiculo } });

    if (!veiculo) {
      throw new AppError('Veículo não encontrado', 404);
    }

    const reserva = await tx.veiculo.updateMany({
      where: { id: idVeiculo, disponivel: true },
      data: { disponivel: false },
    });

    if (reserva.count === 0) {
      throw new AppError('Veículo indisponível para locação', 409);
    }

    const valorTotal = calcularValorTotal(inicio, prevista, veiculo.valorDiaria);

    return tx.locacao.create({
      data: {
        usuarioId,
        veiculoId: idVeiculo,
        dataInicio: inicio,
        dataPrevistaDevolucao: prevista,
        valorTotal,
      },
      include: { veiculo: dadosDoVeiculo },
    });
  });
}

async function listarDoUsuario(usuarioId) {
  return prisma.locacao.findMany({
    where: { usuarioId },
    include: { veiculo: dadosDoVeiculo },
    orderBy: { id: 'desc' },
  });
}

async function finalizar(usuarioId, locacaoId) {
  const id = Number(locacaoId);

  if (!Number.isInteger(id)) {
    throw new AppError('Locação inválida', 400);
  }

  return prisma.$transaction(async (tx) => {
    const locacao = await tx.locacao.findUnique({ where: { id } });

    if (!locacao) {
      throw new AppError('Locação não encontrada', 404);
    }

    if (locacao.usuarioId !== usuarioId) {
      throw new AppError('Você não tem permissão para finalizar esta locação', 403);
    }

    const encerramento = await tx.locacao.updateMany({
      where: { id, status: 'ATIVA' },
      data: { status: 'FINALIZADA', dataDevolucao: new Date() },
    });

    if (encerramento.count === 0) {
      throw new AppError('Locação já finalizada', 409);
    }

    await tx.veiculo.update({
      where: { id: locacao.veiculoId },
      data: { disponivel: true },
    });

    return tx.locacao.findUnique({
      where: { id },
      include: { veiculo: dadosDoVeiculo },
    });
  });
}

module.exports = { registrar, listarDoUsuario, finalizar, calcularValorTotal };
