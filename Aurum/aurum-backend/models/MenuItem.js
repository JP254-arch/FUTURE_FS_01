const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  nameIt:      { type: String, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true, enum: ['antipasti','primi','secondi','dolci','bevande'] },
  image:       { type: String },
  allergens:   [{ type: String }],
  tags:        [{ type: String, enum: ['vegetarian','vegan','gluten-free','signature','seasonal'] }],
  available:   { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

menuItemSchema.index({ category: 1, available: 1, order: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
