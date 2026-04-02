const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async (req, res, next) => {
  try {
    // Accept token from cookie OR Authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      if (req.accepts('html')) return res.redirect('/admin/login');
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin   = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      if (req.accepts('html')) return res.redirect('/admin/login');
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    if (req.accepts('html')) return res.redirect('/admin/login');
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};