require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes    = require('./routes/auth');
const imovelRoutes  = require('./routes/imoveis');
const clienteRoutes = require('./routes/clientes');

const app = express();

// ── Middlewares ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/imoveis',  imovelRoutes);
app.use('/api/clientes', clienteRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'API Imobiliária funcionando ✅' }));

// ── Erro 404 ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada' }));

// ── Erro global ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});

// ── Conexão MongoDB + start ───────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  });
