const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema(
  {
    nome:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    telefone: { type: String, trim: true },
    imovelInteresse: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Imovel',
      default: null,
    },
    observacoes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cliente', clienteSchema);
