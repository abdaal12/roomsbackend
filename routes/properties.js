const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const { upload, deleteFromCloudinary } = require('../utils/cloudinary');

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/properties — public listing with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, roomType, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isAvailable: true };

    if (search && search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [{ area: re }, { address: re }, { title: re }, { city: re }];
    }
    if (roomType) query.roomType = roomType;
    if (maxPrice)  query.priceMin = { $lte: Number(maxPrice) };

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    res.json({
      properties,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/properties/all — admin gets ALL including unavailable
router.get('/all', protect, async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({ properties, total: properties.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/properties/:id — single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN ONLY ────────────────────────────────────────────────────────────────

// POST /api/properties — add new property
router.post('/', protect, upload.array('images', 6), async (req, res) => {
  try {
    // Cloudinary returns secure_url for each uploaded file
    const images = req.files ? req.files.map((f) => f.path) : [];

    const amenities = req.body.amenities
      ? Array.isArray(req.body.amenities)
        ? req.body.amenities
        : req.body.amenities.split(',').map((a) => a.trim())
      : [];

    const property = await Property.create({
      ...req.body,
      priceMin:  Number(req.body.priceMin),
      priceMax:  Number(req.body.priceMax),
      images,
      amenities,
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/properties/:id — edit property
router.put('/:id', protect, upload.array('images', 6), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // New images uploaded to Cloudinary this edit
    const newImages = req.files ? req.files.map((f) => f.path) : [];

    // Existing images the admin chose to keep (sent from frontend)
    let keptImages = [];
    if (req.body.existingImages) {
      keptImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    }

    // Find images that were removed (in DB but not in keptImages)
    const removedImages = property.images.filter(
      (img) => !keptImages.includes(img)
    );

    // Delete removed images from Cloudinary
    await Promise.all(removedImages.map((url) => deleteFromCloudinary(url)));

    // Final images list
    const images = [...keptImages, ...newImages];

    const amenities = req.body.amenities
      ? Array.isArray(req.body.amenities)
        ? req.body.amenities
        : req.body.amenities.split(',').map((a) => a.trim())
      : [];

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        title:          req.body.title,
        description:    req.body.description,
        address:        req.body.address,
        area:           req.body.area,
        city:           req.body.city,
        locationUrl:    req.body.locationUrl,
        priceMin:       Number(req.body.priceMin),
        priceMax:       Number(req.body.priceMax),
        roomType:       req.body.roomType,
        ownerName:      req.body.ownerName,
        ownerPhone:     req.body.ownerPhone,
        ownerWhatsapp:  req.body.ownerWhatsapp,
        amenities,
        images,
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/properties/:id/availability — toggle available/unavailable
router.patch('/:id/availability', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property.isAvailable = !property.isAvailable;
    await property.save();

    res.json({
      message:     `Property marked as ${property.isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: property.isAvailable,
      property,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/properties/:id — delete property + remove images from Cloudinary
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Delete all images from Cloudinary
    await Promise.all(property.images.map((url) => deleteFromCloudinary(url)));

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;