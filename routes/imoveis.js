const express = require('express');
const Imovel  = require('../models/Imovel');
const authMW  = require('../middlewares/auth');

const router = express.Router();

// ── GET /api/imoveis ── Listar com filtros ────────────────
router.get('/', authMW, async (req, res) => {
  try {
    const { busca, cidade, ordenar, pagina = 1, limite = 10 } = req.query;

    const filtro = { ativo: true };

    // Busca por texto no título
    if (busca) {
      filtro.titulo = { $regex: busca, $options: 'i' };
    }

    // Filtro por cidade
    if (cidade) {
      filtro.cidade = { $regex: cidade, $options: 'i' };
    }

    // Ordenação por preço
    let sort = { createdAt: -1 }; // padrão: mais recentes
    if (ordenar === 'preco_asc')  sort = { preco: 1 };
    if (ordenar === 'preco_desc') sort = { preco: -1 };

    const skip  = (Number(pagina) - 1) * Number(limite);
    const total = await Imovel.countDocuments(filtro);
    const imoveis = await Imovel.find(filtro)
      .sort(sort)
      .skip(skip)
      .limit(Number(limite));

    res.json({
      imoveis,
      total,
      paginas: Math.ceil(total / Number(limite)),
      paginaAtual: Number(pagina),
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar imóveis', error: err.message });
  }
});

// ── GET /api/imoveis/:id ── Buscar um ────────────────────
router.get('/:id', authMW, async (req, res) => {
  try {
    const imovel = await Imovel.findById(req.params.id);
    if (!imovel) return res.status(404).json({ message: 'Imóvel não encontrado' });
    res.json(imovel);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar imóvel', error: err.message });
  }
});

// ── POST /api/imoveis ── Criar ───────────────────────────
router.post('/', authMW, async (req, res) => {
  try {
    const { titulo, preco, cidade, tipo, quartos, banheiros, descricao, imagem } = req.body;

    if (!titulo || !preco || !cidade || !tipo) {
      return res.status(400).json({ message: 'Título, preço, cidade e tipo são obrigatórios' });
    }

    const imovel = await Imovel.create({ titulo, preco, cidade, tipo, quartos, banheiros, descricao, imagem });
    res.status(201).json({ message: 'Imóvel criado com sucesso', imovel });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar imóvel', error: err.message });
  }
});

// ── PUT /api/imoveis/:id ── Editar ───────────────────────
router.put('/:id', authMW, async (req, res) => {
  try {
    const imovel = await Imovel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!imovel) return res.status(404).json({ message: 'Imóvel não encontrado' });
    res.json({ message: 'Imóvel atualizado com sucesso', imovel });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar imóvel', error: err.message });
  }
});

// ── DELETE /api/imoveis/:id ── Excluir (soft delete) ─────
router.delete('/:id', authMW, async (req, res) => {
  try {
    const imovel = await Imovel.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );
    if (!imovel) return res.status(404).json({ message: 'Imóvel não encontrado' });
    res.json({ message: 'Imóvel excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir imóvel', error: err.message });
  }
});

// ── GET /api/imoveis/stats/resumo ── Dashboard ───────────
router.get('/stats/resumo', authMW, async (req, res) => {
  try {
    const totalImoveis   = await Imovel.countDocuments({ ativo: true });
    const ultimosImoveis = await Imovel.find({ ativo: true }).sort({ createdAt: -1 }).limit(5);
    const precoMedio     = await Imovel.aggregate([
      { $match: { ativo: true } },
      { $group: { _id: null, media: { $avg: '$preco' } } },
    ]);

    res.json({
      totalImoveis,
      ultimosImoveis,
      precoMedio: precoMedio[0]?.media || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar resumo', error: err.message });
  }
});

module.exports = router;
