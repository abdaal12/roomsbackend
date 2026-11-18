const express = require('express');
const router = express.Router();
const LeadRequest = require('../models/LeadRequest');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const { sendLeadEmail } = require('../utils/email');

// POST /api/leads — PUBLIC (callback form or urgent call)
router.post('/', async (req, res) => {
  try {
    const { propertyId, name, phone, whatsapp, type } = req.body;

    if (!propertyId || !name || !phone) {
      return res
        .status(400)
        .json({ message: 'Property, name, and phone are required.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const lead = await LeadRequest.create({
      property: propertyId,
      name,
      phone,
      whatsapp: whatsapp || phone,
      type: type || 'callback',
    });

    // Email admin (don't fail the request if email fails)
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

// GET /api/leads — ADMIN: only leads for MY properties
router.get('/', protect, async (req, res) => {
  try {
    const myProps = await Property.find({ createdBy: req.admin._id }).select('_id');
    const leads = await LeadRequest.find({
      property: { $in: myProps.map((p) => p._id) },
    })
      .populate('property', 'title area city')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/leads/:id/status — ADMIN: only for MY properties
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const lead = await LeadRequest.findById(req.params.id).populate(
      'property',
      'createdBy'
    );

    if (
      !lead ||
      !lead.property ||
      String(lead.property.createdBy) !== String(req.admin._id)
    ) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.status = req.body.status;
    await lead.save();

    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;