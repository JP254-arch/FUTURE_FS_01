const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../config/email');
const Contact = require('../models/Contact');

// POST /api/contact
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message too short'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, email, message, subject } = req.body;

    // 1. Save to DB
    await Contact.create({ name, email, subject: subject || 'Enquiry', message });

    // 2. Send emails (confirmation to user + notification to owner)
    await Promise.allSettled([
      emailService.sendContactReply({ name, email, message }),
      emailService.sendContactOwnerNotification({ name, email, subject, message }),
    ]);

    res.json({ success: true, message: 'Message received. We will reply within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not send message. Please call us directly.' });
  }
});

// GET /api/contact — admin, list all messages
router.get('/', require('../middleware/auth'), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/contact/:id/read — mark as read
router.patch('/:id/read', require('../middleware/auth'), async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/contact/:id
router.delete('/:id', require('../middleware/auth'), async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;