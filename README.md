# Sistema de Locação de Veículos

Projeto da disciplina **Programação com Frameworks Web** (UNIPÊ).

Sistema web para uma locadora cadastrar veículos, controlar a disponibilidade da frota e registrar as locações feitas por usuários autenticados. Inclui cadastro e listagem de veículos, início e finalização de locações, cálculo do valor e histórico.

## Integrante

- NOME COMPLETO DO ALUNO

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Backend | Node.js, Express 5, JavaScript |
| Banco de dados | MySQL 8, Prisma ORM 6 |
| Autenticação | JWT (`jsonwebtoken`) e `bcryptjs` |
| Frontend | React 19, Vite |

## Funcionalidades

- **Usuários:** cadastro com nome, e-mail e senha, login com retorno de JWT, consulta do perfil e logout no frontend.
- **Veículos:** cadastro com placa única e diária positiva, listagem com disponibilidade e filtro de veículos disponíveis.
- **Locações:** registro com veículo e período, cálculo do valor no backend, listagem do histórico do usuário e finalização (devolução).

## Regras de negócio implementadas

1. Todas as rotas de veículos e locações exigem o cabeçalho `Authorization: Bearer <token>`.
2. Um veículo não pode ter duas locações ativas. Ao iniciar a locação ele fica indisponível e, ao finalizar, volta a ficar disponível.
3. A data prevista de devolução precisa ser posterior à data de início.
4. Valor total = número de diárias × valor da diária. Qualquer fração de 24 horas conta como uma diária completa (`Math.ceil`).
5. O usuário só vê e só finaliza as próprias locações. O id do usuário vem do token, nunca do corpo da requisição.
6. Placas e e-mails são únicos. A placa é normalizada em maiúsculas e sem traço (`abc-1d23` vira `ABC1D23`).
7. Uma locação finalizada não pode ser finalizada de novo.
8. Não há exclusão de veículos nem de locações, então o histórico fica preservado.
9. A reserva do veículo e a criação da locação acontecem dentro de uma transação (`prisma.$transaction`). A reserva usa `updateMany` com a condição `disponivel: true`, e o banco só deixa uma requisição concorrente vencer. As demais recebem `409`.

## Estrutura do projeto

```
locadora-veiculos/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        Modelos Usuario, Veiculo e Locacao
│   │   ├── migrations/          Migrations versionadas
│   │   └── seed.js              Dados de exemplo
│   └── src/
│       ├── server.js            Inicia o servidor
│       ├── app.js               Configura Express, rotas e tratamento de erros
│       ├── prisma.js            Instância única do PrismaClient
│       ├── errors/AppError.js   Erro com código HTTP
│       ├── middlewares/         autenticacao.js (JWT) e tratarErros.js
│       ├── routes/              Mapeamento dos endpoints
│       ├── controllers/         Entrada e resposta HTTP
│       └── services/            Validações e regras de negócio
└── frontend/
    └── src/
        ├── api.js               Função requisicao (fetch + token)
        ├── App.jsx              Controle de sessão e atualização das telas
        └── components/          Autenticacao, Veiculos e Locacoes
```

## Rotas da API

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/auth/cadastro` | Não | Cadastra usuário (`nome`, `email`, `senha`) |
| POST | `/auth/login` | Não | Retorna `token` e dados do usuário |
| GET | `/auth/perfil` | Sim | Dados do usuário logado |
| GET | `/veiculos` | Sim | Lista todos os veículos |
| GET | `/veiculos?disponivel=true` | Sim | Lista só os disponíveis |
| POST | `/veiculos` | Sim | Cadastra veículo (`marca`, `modelo`, `placa`, `ano`, `valorDiaria`) |
| GET | `/locacoes` | Sim | Lista as locações do usuário logado |
| POST | `/locacoes` | Sim | Registra locação (`veiculoId`, `dataInicio`, `dataPrevistaDevolucao`) |
| PATCH | `/locacoes/:id/finalizar` | Sim | Finaliza a locação e libera o veículo |

### Códigos de resposta

| Código | Quando |
|---|---|
| 200 / 201 | Sucesso / recurso criado |
| 400 | Dados inválidos (campo faltando, data inválida, diária negativa) |
| 401 | Token ausente, inválido ou expirado, ou credenciais erradas |
| 403 | Tentativa de finalizar locação de outro usuário |
| 404 | Veículo ou locação inexistente |
| 409 | Conflito: e-mail ou placa duplicados, veículo indisponível, locação já finalizada |

## Requisitos

- Node.js 20 ou superior
- MySQL 8 (instalado localmente ou via Docker)

## Instalação e execução

### 1. Banco de dados

Com MySQL instalado, crie um banco chamado `locadora`. Se preferir o Docker, use:

```bash
docker run -d --name locadora-mysql -e MYSQL_ROOT_PASSWORD=sua_senha -e MYSQL_DATABASE=locadora -p 3306:3306 mysql:8.4
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com o usuário, a senha e a porta do seu MySQL e um `JWT_SECRET` próprio. Depois:

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

A API sobe em `http://localhost:3333`.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. Se a API estiver em outro endereço, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

## Dados de exemplo (seed)

| Usuário | E-mail | Senha |
|---|---|---|
| Ana Teste | ana@teste.com | 123456 |
| Bruno Teste | bruno@teste.com | 123456 |

Veículos: Fiat Argo (ABC1D23), Chevrolet Onix (DEF4G56) e Volkswagen Polo (GHI7J89).

## Exemplo de uso pela API

```bash
TOKEN=$(curl -s -X POST localhost:3333/auth/login -H "Content-Type: application/json" -d '{"email":"ana@teste.com","senha":"123456"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')

curl -s localhost:3333/veiculos -H "Authorization: Bearer $TOKEN"

curl -s -X POST localhost:3333/locacoes -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"veiculoId":1,"dataInicio":"2026-12-01T10:00:00","dataPrevistaDevolucao":"2026-12-03T12:00:00"}'

curl -s -X PATCH localhost:3333/locacoes/1/finalizar -H "Authorization: Bearer $TOKEN"
```

## Decisões de implementação

- **Camadas:** a rota só aponta para o controller. O controller lê `req` e devolve `res` com o código HTTP. Toda validação e regra de negócio fica no service, que é o único a falar com o Prisma.
- **Erros:** os services lançam `AppError(mensagem, status)`. O middleware `tratarErros` converte esse erro na resposta JSON `{ "erro": "..." }`. O Express 5 encaminha automaticamente os erros de funções `async` para esse middleware.
- **Senha:** a senha é guardada como hash bcrypt com custo 10. As consultas de usuário usam `select` sem o campo `senha`, então o hash nunca sai da API.
- **JWT:** o token carrega só o `id` do usuário e expira em 1 dia (configurável em `JWT_EXPIRES_IN`).
- **Concorrência:** veja a regra 9 acima.
- **Valores monetários:** são guardados como `Decimal(10,2)` para evitar erro de arredondamento de ponto flutuante no banco.
- **Frontend:** formulários controlados com `useState`. Depois de cada operação, `App` incrementa `versao`, e os componentes recarregam os dados da API via `useEffect`.
