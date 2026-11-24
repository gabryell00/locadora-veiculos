const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const locacaoRoutes = require('./routes/locacaoRoutes');
const tratarErros = require('./middlewares/tratarErros');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/locacoes', locacaoRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use(tratarErros);

module.exports = app;
