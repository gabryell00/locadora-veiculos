const prisma = require('../prisma');
const AppError = require('../errors/AppError');

async function cadastrar({ marca, modelo, placa, ano, valorDiaria }) {
  if (!marca || !modelo || !placa || !ano || valorDiaria === undefined) {
    throw new AppError('Marca, modelo, placa, ano e valor da diária são obrigatórios', 400);
  }

  const anoNumero = Number(ano);
  const diaria = Number(valorDiaria);

  if (!Number.isInteger(anoNumero) || anoNumero < 1900 || anoNumero > new Date().getFullYear() + 1) {
    throw new AppError('Ano inválido', 400);
  }

  if (!Number.isFinite(diaria) || diaria <= 0) {
    throw new AppError('O valor da diária deve ser positivo', 400);
  }

  const placaNormalizada = String(placa).toUpperCase().replace(/[^A-Z0-9]/g, '');

  const existente = await prisma.veiculo.findUnique({ where: { placa: placaNormalizada } });

  if (existente) {
    throw new AppError('Placa já cadastrada', 409);
  }

  return prisma.veiculo.create({
    data: {
      marca,
      modelo,
      placa: placaNormalizada,
      ano: anoNumero,
      valorDiaria: diaria,
    },
  });
}

async function listar({ somenteDisponiveis }) {
  return prisma.veiculo.findMany({
    where: somenteDisponiveis ? { disponivel: true } : undefined,
    orderBy: { id: 'asc' },
  });
}

module.exports = { cadastrar, listar };
