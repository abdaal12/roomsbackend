const express = require('express');
const router = express.Router();
const LeadRequest = require('../models/LeadRequest');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const { sendLeadEmail } = require('../utils/email');

// POST /api/leads  — PUBLIC (user submits callback or urgent call)
router.post('/', async (req, res) => {
  try {
    const { propertyId, name, phone, whatsapp, type } = req.body;

    if (!propertyId || !name || !phone)
      return res.status(400).json({ message: 'Property, name, and phone are required.' });

    // Get property details for email
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: 'Property not found.' });

    // Save lead to DB
    const lead = await LeadRequest.create({
      property: propertyId,
      name,
      phone,
      whatsapp: whatsapp || phone,
      type: type || 'callback',
    });

    // Send email to admin (non-blocking — don't fail if email fails)
    sendLeadEmail(lead, property).catch((err) =>
      console.error('Email send failed:', err.message)
    );

    res.status(201).json({
      message:
        type === 'urgent'
          ? 'Connecting you with our team right now!'
          : 'Request received! We will call you back soon.',
      lead,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/leads  — ADMIN ONLY
router.get('/', protect, async (req, res) => {
  try {
    const leads = await LeadRequest.find()
      .populate('property', 'title area city')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/leads/:id/status  — ADMIN ONLY
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const lead = await LeadRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;