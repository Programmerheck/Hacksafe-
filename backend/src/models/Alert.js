const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an alert title'],
  },
  description: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true,
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
    index: true,
  },
  sourceIP: {
    type: String,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
  assignedTo: {
    type: String,
    default: 'Unassigned',
  },
});

module.exports = mongoose.model('Alert', AlertSchema);
