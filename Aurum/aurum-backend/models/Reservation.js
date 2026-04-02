const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  phone:       { type: String, trim: true },
  date:        { type: Date,   required: true },
  time:        { type: String, required: true },
  guests:      { type: Number, required: true, min: 1, max: 20 },
  occasion:    { type: String, enum: ['none','anniversary','birthday','business','proposal','other'], default: 'none' },
  requests:    { type: String, maxlength: 500 },
  status:      { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  confirmationId: { type: String, unique: true },
  notifiedAt:  { type: Date },
}, { timestamps: true });

reservationSchema.index({ date: 1, status: 1 });
reservationSchema.index({ email: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
