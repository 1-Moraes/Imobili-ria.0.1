const mongoose = require('mongoose');

const imovelSchema = new mongoose.Schema(
  {
    titulo:    { type: String, required: true, trim: true },
    preco:     { type: Number, required: true, min: 0 },
    cidade:    { type: String, required: true, trim: true },
    tipo:      { type: String, required: true, enum: ['Casa', 'Apartamento', 'Terreno', 'Comercial', 'Chácara', 'Outro'] },
    quartos:   { type: Number, default: 0, min: 0 },
    banheiros: { type: Number, default: 0, min: 0 },
    descricao: { type: String, trim: true },
    imagem:    { type: String, trim: true }, // URL da imagem
    ativo:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Índice de busca textual
imovelSchema.index({ titulo: 'text', cidade: 'text', descricao: 'text' });

module.exports = mongoose.model('Imovel', imovelSchema);
