const express = require('express');
const { getAlerts, updateAlertStatus, deleteAlert } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAlerts);
router.put('/:id', protect, updateAlertStatus);
router.delete('/:id', protect, authorize('admin'), deleteAlert);

module.exports = router;
