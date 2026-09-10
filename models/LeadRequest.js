const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
    },
    // 'callback' = user filled form | 'urgent' = urgent call request
    type: {
      type: String,
      enum: ['callback', 'urgent'],
      default: 'callback',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'done'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeadRequest', leadSchema);