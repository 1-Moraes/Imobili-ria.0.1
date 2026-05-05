const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nome:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true, minlength: 6 },
    role:  { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

// Hash antes de salvar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 12);
  next();
});

// Comparar senha
usuarioSchema.methods.compararSenha = function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

// Não retornar a senha nas consultas
usuarioSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.senha; return ret; },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
