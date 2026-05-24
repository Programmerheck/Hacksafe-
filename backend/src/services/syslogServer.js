const dgram = require('dgram');
const Log = require('../models/Log');
const Alert = require('../models/Alert');
const { getIO } = require('./websocketService');

const startSyslogServer = (port = 514) => {
  const server = dgram.createSocket('udp4');

  server.on('message', async (msg, rinfo) => {
    const rawLog = msg.toString().trim();
    console.log(`[SYSLOG INGEST] Received syslog packet from ${rinfo.address}:${rinfo.port}`);

    try {
      // Parse Syslog message
      const parsedLog = parseSyslogString(rawLog, rinfo.address);

      // Save log to database
      const savedLog = await Log.create(parsedLog);

      // Broadcast log over WebSocket
      const io = getIO();
      if (io) {
        io.emit('new-log', savedLog);
      }

      // Automatically trigger alert if log is high severity
      if (savedLog.severity === 'critical' || savedLog.severity === 'error') {
        const isCritical = savedLog.severity === 'critical';
        const alert = await Alert.create({
          title: `${savedLog.category.toUpperCase()} Intrusive Threat Detected`,
          description: savedLog.message,
          severity: isCritical ? 'critical' : 'high',
          status: 'open',
          sourceIP: savedLog.sourceIP,
        });

        // Broadcast alert over WebSocket
        if (io) {
          io.emit('new-alert', alert);
        }
      }
    } catch (error) {
      console.error(`[SYSLOG INGEST] Error processing ingested syslog: ${error.message}`);
    }
  });

  server.on('error', (err) => {
    console.error(`[SYSLOG INGEST] Syslog server error:\n${err.stack}`);
    server.close();
  });

  server.on('listening', () => {
    const address = server.address();
    console.log(`[SYSLOG INGEST] UDP Syslog Server listening on ${address.address}:${address.port}`);
  });

  // Bind to port (using try-catch block for cases where port is already in use or permission denied on Windows/Linux)
  try {
    server.bind(port);
  } catch (error) {
    console.error(`[SYSLOG INGEST] Failed to bind to UDP port ${port}: ${error.message}. External logs ingestion over UDP will be disabled.`);
  }

  return server;
};

// Helper function to parse raw RFC syslog format
function parseSyslogString(syslogStr, sourceIP) {
  const logData = {
    timestamp: new Date(),
    sourceIP: sourceIP || '127.0.0.1',
    hostname: 'external-kali-host',
    severity: 'info',
    category: 'system',
    message: syslogStr,
    parsedDetails: { raw: syslogStr, protocol: 'UDP' },
  };

  try {
    // RFC regex match: <PRIVAL>VERSION TIMESTAMP HOSTNAME APP-NAME PROCID MSGID MSG
    const rfcRegex = /^<(\d+)>(?:(\d)\s+)?([^\s]+)\s+([^\s]+)\s+([^\s]+)(?:\s+[^\s]+)?(?:\s+[^\s]+)?(?:\s+-\s+)?(.*)$/;
    const matches = syslogStr.match(rfcRegex);

    if (matches) {
      const priVal = parseInt(matches[1]);
      const timestampStr = matches[3];
      const hostname = matches[4];
      const categoryHint = matches[5].toLowerCase();
      const message = matches[6];

      // Parse severity from PRI value
      const sevVal = priVal % 8;
      let severity = 'info';
      if (sevVal === 0 || sevVal === 1 || sevVal === 2) severity = 'critical';
      else if (sevVal === 3) severity = 'error';
      else if (sevVal === 4) severity = 'warning';

      logData.timestamp = new Date(timestampStr);
      logData.hostname = hostname;
      logData.severity = severity;
      logData.message = message;

      // Classify categories
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
        protocol: 'UDP',
        parsedSuccessfully: true,
      };
    } else {
      // Non-RFC plain text logs
      const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      const ipMatch = syslogStr.match(ipRegex);
      if (ipMatch) {
        logData.sourceIP = ipMatch[0];
      }

      const lowerMsg = syslogStr.toLowerCase();
      if (lowerMsg.includes('critical') || lowerMsg.includes('alert') || lowerMsg.includes('emergency')) {
        logData.severity = 'critical';
      } else if (lowerMsg.includes('error') || lowerMsg.includes('fail')) {
        logData.severity = 'error';
      } else if (lowerMsg.includes('warning') || lowerMsg.includes('alert')) {
        logData.severity = 'warning';
      }

      if (lowerMsg.includes('auth') || lowerMsg.includes('login') || lowerMsg.includes('ssh')) {
        logData.category = 'auth';
      } else if (lowerMsg.includes('firewall') || lowerMsg.includes('port scan') || lowerMsg.includes('blocked')) {
        logData.category = 'firewall';
      } else if (lowerMsg.includes('malware') || lowerMsg.includes('trojan') || lowerMsg.includes('backdoor')) {
        logData.category = 'malware';
      }
    }

    return logData;
  } catch (err) {
    return logData;
  }
}

module.exports = startSyslogServer;
