const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  path: {
    type: String,
    default: '/'
  },
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
