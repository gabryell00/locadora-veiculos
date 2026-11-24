require('dotenv/config');
const bcrypt = require('bcryptjs');
const prisma = require('../src/prisma');

async function main() {
  const senha = await bcrypt.hash('123456', 10);

  await prisma.usuario.upsert({
    where: { email: 'ana@teste.com' },
    update: {},
    create: { nome: 'Ana Teste', email: 'ana@teste.com', senha },
  });

  await prisma.usuario.upsert({
    where: { email: 'bruno@teste.com' },
    update: {},
    create: { nome: 'Bruno Teste', email: 'bruno@teste.com', senha },
  });

  const veiculos = [
    { marca: 'Fiat', modelo: 'Argo', placa: 'ABC1D23', ano: 2022, valorDiaria: 120 },
    { marca: 'Chevrolet', modelo: 'Onix', placa: 'DEF4G56', ano: 2023, valorDiaria: 135 },
    { marca: 'Volkswagen', modelo: 'Polo', placa: 'GHI7J89', ano: 2021, valorDiaria: 110 },
  ];

  for (const veiculo of veiculos) {
    await prisma.veiculo.upsert({
      where: { placa: veiculo.placa },
      update: {},
      create: veiculo,
    });
  }

  console.log('Seed concluído');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
