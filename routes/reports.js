const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const { sendReportEmail } = require('../utils/email');

// POST /api/reports — public, user submits report
router.post('/', async (req, res) => {
  try {
    const { propertyId, reason, details, reporterName, reporterPhone } = req.body;

    if (!propertyId || !reason) {
      return res.status(400).json({ message: 'Property and reason are required.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const report = await Report.create({
      property:      propertyId,
      propertyTitle: property.title,
      reason,
      details:       details || '',
      reporterName:  reporterName || 'Anonymous',
      reporterPhone: reporterPhone || '',
    });

    // Email admin
    sendReportEmail(report, property).catch((err) =>
      console.error('Report email failed:', err.message)
    );

    res.status(201).json({
      message: 'Report submitted. Our team will review it shortly.',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/reports — admin only
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('property', 'title area city')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reports/:id/status — admin only
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;