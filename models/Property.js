const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Area / locality is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    // Google Maps embed URL or coordinates link
    locationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    priceMin: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: 0,
    },
    priceMax: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: 0,
    },
    roomType: {
      type: String,
      enum: ['Single Room', 'Double Room', 'Studio', '1BHK', '2BHK', '3BHK', 'PG', 'Flat'],
      default: 'Single Room',
    },
    amenities: [{ type: String }],
    images: [{ type: String }], // file paths
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    ownerPhone: {
      type: String,
      required: [true, 'Owner phone is required'],
      trim: true,
    },
    ownerWhatsapp: {
      type: String,
      trim: true,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);