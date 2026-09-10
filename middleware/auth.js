const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized. Admin login required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id);
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin account not found.' });
    }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = { protect };