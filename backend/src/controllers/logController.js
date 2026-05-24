const Log = require('../models/Log');
const Alert = require('../models/Alert');
const { getIO } = require('../services/websocketService');

// @desc    Get all logs (filtered & paginated)
// @route   GET /api/logs
// @access  Private
exports.getLogs = async (req, res) => {
  try {
    const { severity, category, sourceIP, search, limit = 100, page = 1 } = req.query;

    const query = {};

    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (sourceIP) query.sourceIP = sourceIP;

    if (search) {
      query.$text = { $search: search };
    }

    const total = await Log.countDocuments(query);
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Ingest a single log (Structured or Syslog text)
// @route   POST /api/logs/ingest
// @access  Public (Can be protected but often open to collector daemons)
exports.ingestLog = async (req, res) => {
  try {
    let logData = req.body;

    // Handle raw string ingestion (Syslog format)
    if (typeof req.body === 'string' || req.body.rawLog) {
      const rawText = typeof req.body === 'string' ? req.body : req.body.rawLog;
      logData = parseSyslogString(rawText);
    }

    // Assign IP from request if not provided
    if (!logData.sourceIP) {
      logData.sourceIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
    }

    // Clean IP address representation
    if (logData.sourceIP.startsWith('::ffff:')) {
      logData.sourceIP = logData.sourceIP.replace('::ffff:', '');
    }

    const log = await Log.create(logData);

    // Broadcast log over WebSocket
    const io = getIO();
    if (io) {
      io.emit('new-log', log);
    }

    // Automatically trigger alert if log is high severity (error or critical)
    if (log.severity === 'critical' || log.severity === 'error') {
      const isCritical = log.severity === 'critical';
      const alert = await Alert.create({
        title: `${log.category.toUpperCase()} Threat Detected`,
        description: log.message,
        severity: isCritical ? 'critical' : 'high',
        status: 'open',
        sourceIP: log.sourceIP,
      });

      // Broadcast alert over WebSocket
      if (io) {
        io.emit('new-alert', alert);
      }
    }

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clear all logs (Admin only)
// @route   DELETE /api/logs
// @access  Private/Admin
exports.clearLogs = async (req, res) => {
  try {
    await Log.deleteMany({});
    res.status(200).json({
      success: true,
      message: 'All security logs have been wiped from SIEM history',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to parse raw RFC syslog format (Syslog parser)
// Example format: <34>1 2026-05-22T08:00:00.000Z 192.168.1.50 my-kali-machine auth - - Brute force attack detected on SSH port 22
function parseSyslogString(syslogStr) {
  try {
    const logData = {
      timestamp: new Date(),
      sourceIP: '127.0.0.1',
      hostname: 'kali-collector',
      severity: 'info',
      category: 'system',
      message: syslogStr,
      parsedDetails: { raw: syslogStr },
    };

    // Very simple regex-based syslog parser
    // Matches: <PRIVAL>VERSION TIMESTAMP HOSTNAME APP-NAME PROCID MSGID MSG
    const rfcRegex = /^<(\d+)>(?:(\d)\s+)?([^\s]+)\s+([^\s]+)\s+([^\s]+)(?:\s+[^\s]+)?(?:\s+[^\s]+)?(?:\s+-\s+)?(.*)$/;
    const matches = syslogStr.match(rfcRegex);

    if (matches) {
      const priVal = parseInt(matches[1]);
      const timestampStr = matches[3];
      const hostname = matches[4];
      const categoryHint = matches[5].toLowerCase();
      const message = matches[6];

      // Parse severity from PRI value
      // Severity is PRI % 8
      const sevVal = priVal % 8;
      let severity = 'info';
      if (sevVal === 0 || sevVal === 1 || sevVal === 2) severity = 'critical'; // Emergency, Alert, Critical
      else if (sevVal === 3) severity = 'error'; // Error
      else if (sevVal === 4) severity = 'warning'; // Warning
      
      logData.timestamp = new Date(timestampStr);
      logData.hostname = hostname;
      logData.severity = severity;
      logData.message = message;

      // Extract IP address from message or hostname if possible
      const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      const ipMatch = syslogStr.match(ipRegex);
      if (ipMatch) {
        logData.sourceIP = ipMatch[0];
      }

      // Assign category based on matching keywords
      if (categoryHint.includes('auth') || message.toLowerCase().includes('login') || message.toLowerCase().includes('password') || message.toLowerCase().includes('ssh')) {
        logData.category = 'auth';
      } else if (categoryHint.includes('firewall') || message.toLowerCase().includes('block') || message.toLowerCase().includes('iptables') || message.toLowerCase().includes('port scan')) {
        logData.category = 'firewall';
      } else if (message.toLowerCase().includes('malware') || message.toLowerCase().includes('virus') || message.toLowerCase().includes('trojan') || message.toLowerCase().includes('payload')) {
        logData.category = 'malware';
      } else {
        logData.category = 'system';
      }

      logData.parsedDetails = {
        priVal,
        app: categoryHint,
        parsedSuccessfully: true,
      };
    }

    return logData;
  } catch (err) {
    return {
      timestamp: new Date(),
      sourceIP: '127.0.0.1',
      hostname: 'syslog-error-parser',
      severity: 'error',
      category: 'system',
      message: `Failed to parse syslog: ${syslogStr}`,
      parsedDetails: { raw: syslogStr, error: err.message },
    };
  }
}
