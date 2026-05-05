const express = require('express');
const Cliente = require('../models/Cliente');
const authMW  = require('../middlewares/auth');

const router = express.Router();

// ── GET /api/clientes ── Listar ──────────────────────────
router.get('/', authMW, async (req, res) => {
  try {
    const { busca, imovel } = req.query;
    const filtro = {};

    if (busca) {
      filtro.$or = [
        { nome:  { $regex: busca, $options: 'i' } },
        { email: { $regex: busca, $options: 'i' } },
      ];
    }

    if (imovel) filtro.imovelInteresse = imovel;

    const clientes = await Cliente.find(filtro)
      .populate('imovelInteresse', 'titulo cidade preco')
      .sort({ createdAt: -1 });

    res.json({ clientes, total: clientes.length });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar clientes', error: err.message });
  }
});

// ── GET /api/clientes/:id ── Buscar um ───────────────────
router.get('/:id', authMW, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
      .populate('imovelInteresse', 'titulo cidade preco tipo');
    if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar cliente', error: err.message });
  }
});

// ── POST /api/clientes ── Criar ──────────────────────────
router.post('/', authMW, async (req, res) => {
  try {
    const { nome, email, telefone, imovelInteresse, observacoes } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e email são obrigatórios' });
    }

    const cliente = await Cliente.create({ nome, email, telefone, imovelInteresse, observacoes });
    await cliente.populate('imovelInteresse', 'titulo cidade preco');

    res.status(201).json({ message: 'Cliente cadastrado com sucesso', cliente });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cadastrar cliente', error: err.message });
  }
});

// ── PUT /api/clientes/:id ── Editar ──────────────────────
router.put('/:id', authMW, async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('imovelInteresse', 'titulo cidade preco');

    if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json({ message: 'Cliente atualizado com sucesso', cliente });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar cliente', error: err.message });
  }
});

// ── DELETE /api/clientes/:id ── Excluir ──────────────────
router.delete('/:id', authMW, async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir cliente', error: err.message });
  }
});

// ── GET /api/clientes/stats/resumo ────────────────────────
router.get('/stats/resumo', authMW, async (req, res) => {
  try {
    const totalClientes   = await Cliente.countDocuments();
    const ultimosClientes = await Cliente.find()
      .populate('imovelInteresse', 'titulo')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ totalClientes, ultimosClientes });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar resumo de clientes', error: err.message });
  }
});

module.exports = router;
