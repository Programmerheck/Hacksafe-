const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  sourceIP: {
    type: String,
    required: true,
    index: true,
  },
  hostname: {
    type: String,
    default: 'unknown-host',
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
    index: true,
  },
  category: {
    type: String,
    enum: ['firewall', 'auth', 'malware', 'system'],
    default: 'system',
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  parsedDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Adding a text index for full-text search capability
LogSchema.index({ message: 'text', sourceIP: 'text', hostname: 'text' });

module.exports = mongoose.model('Log', LogSchema);
