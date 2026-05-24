const Alert = require('../models/Alert');
const { getIO } = require('../services/websocketService');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const { status, severity } = req.query;
    const query = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;

    const alerts = await Alert.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update alert status (Resolve alert)
// @route   PUT /api/alerts/:id
// @access  Private
exports.updateAlertStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    let alert = await Alert.findById(req.id || req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Security alert not found',
      });
    }

    if (status) {
      alert.status = status;
      if (status === 'resolved') {
        alert.resolvedAt = new Date();
      } else {
        alert.resolvedAt = undefined;
      }
    }

    if (assignedTo) {
      alert.assignedTo = assignedTo;
    }

    await alert.save();

    // Broadcast the updated alert status over WebSocket
    const io = getIO();
    if (io) {
      io.emit('update-alert', alert);
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete alert (Admin only)
// @route   DELETE /api/alerts/:id
// @access  Private/Admin
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Security alert not found',
      });
    }

    await alert.deleteOne();

    // Broadcast the alert deletion over WebSocket
    const io = getIO();
    if (io) {
      io.emit('delete-alert', req.params.id);
    }

    res.status(200).json({
      success: true,
      message: 'Alert has been permanently removed from SIEM system',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
