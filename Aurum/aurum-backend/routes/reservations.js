const express   = require('express');
const router    = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Reservation = require('../models/Reservation');
const emailService = require('../config/email');
const auth = require('../middleware/auth');

const validate = [
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('time').notEmpty().withMessage('Time required'),
  body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be 1–20'),
];

// POST /api/reservations — public, from website form
router.post('/', validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { firstName, lastName, email, phone, date, time, guests, occasion, requests } = req.body;
    const confirmationId = `AUR-${uuidv4().slice(0,8).toUpperCase()}`;

    const reservation = await Reservation.create({
      firstName, lastName, email, phone, date, time,
      guests: parseInt(guests), occasion, requests, confirmationId,
    });

    // Send emails (non-blocking — don't fail the request if email fails)
    Promise.allSettled([
      emailService.sendReservationConfirmation(reservation),
      emailService.sendOwnerNotification(reservation),
    ]).then(results => {
      results.forEach(r => { if (r.status === 'rejected') console.error('Email error:', r.reason); });
    });

    res.status(201).json({
      success: true,
      message: 'Reservation received! Check your email for confirmation.',
      confirmationId,
    });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ success: false, message: 'Could not create reservation. Please try again.' });
  }
});

// GET /api/reservations — admin only
router.get('/', auth, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }
    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, total, page: parseInt(page), reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/reservations/:id/status — admin only
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending','confirmed','cancelled','completed'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!reservation) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/reservations/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
