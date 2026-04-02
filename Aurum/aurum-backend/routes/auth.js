const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin   = require('../models/Admin');
const auth    = require('../middleware/auth');
const emailService = require('../config/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Invalid credentials' });
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    admin.lastLogin = new Date();
    await admin.save();
    const token = signToken(admin._id);
    res.cookie('token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, token, admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// POST /api/auth/change-password
router.post('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!(await admin.comparePassword(req.body.currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    admin.password = req.body.newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
