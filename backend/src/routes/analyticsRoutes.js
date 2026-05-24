const express = require('express');
const { getAnalyticsStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAnalyticsStats);

module.exports = router;
