const express  = require('express');
const jwt      = require('jsonwebtoken');
const Usuario  = require('../models/Usuario');
const authMW   = require('../middlewares/auth');

const router = express.Router();

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro no login', error: err.message });
  }
});

// ── POST /api/auth/register ── (criar primeiro admin) ─────
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const usuario = await Usuario.create({ nome, email, senha });
    res.status(201).json({ message: 'Usuário criado com sucesso', usuario });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar', error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────
router.get('/me', authMW, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;
