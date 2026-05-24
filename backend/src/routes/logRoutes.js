const express = require('express');
const { getLogs, ingestLog, clearLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', protect, getLogs);
router.post('/ingest', apiLimiter, ingestLog);
router.delete('/', protect, authorize('admin'), clearLogs);

module.exports = router;
