const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyTitle: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      enum: [
        'Property does not exist',
        'Fake information',
        'Wrong contact details',
        'Unauthorized listing',
        'Fraud / Scam',
        'Offensive content',
        'Other',
      ],
      required: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    reporterName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
    reporterPhone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'resolved'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);