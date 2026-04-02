const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  caption:   { type: String },
  filename:  { type: String, required: true },
  url:       { type: String, required: true },
  category:  { type: String, enum: ['dining','food','kitchen','events','exterior'], default: 'food' },
  featured:  { type: Boolean, default: false },
  order:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', gallerySchema);
