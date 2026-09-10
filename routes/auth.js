const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register  — create admin account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters.' });

    const existing = await Admin.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ message: 'An admin with this email already exists.' });

    const admin = await Admin.create({ name, email, password });
    const token = signToken(admin._id);

    res.status(201).json({
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password)))
      return res
        .status(401)
        .json({ message: 'Incorrect email or password.' });

    const token = signToken(admin._id);

    res.json({
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  — verify token
router.get('/me', protect, (req, res) => {
  const { _id, name, email } = req.admin;
  res.json({ _id, name, email });
});

module.exports = router;