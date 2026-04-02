const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../config/email');

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

    await Promise.allSettled([
      emailService.sendContactReply({ name, email, message }),
      // Forward to owner
      require('nodemailer').createTransport({
        host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT) || 587,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      }).sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.NOTIFY_EMAIL,
        subject: `Contact Form: ${subject || 'Enquiry'} — ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    ]);

    res.json({ success: true, message: 'Message received. We will reply within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not send message. Please call us directly.' });
  }
});

module.exports = router;
