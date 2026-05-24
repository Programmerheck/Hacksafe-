const Log = require('../models/Log');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { getIO } = require('./websocketService');

const mockHosts = ['hs-firewall-core', 'hs-web-prod-01', 'hs-db-prod', 'hs-active-directory', 'hs-mail-gateway'];
const mockIPs = [
  { ip: '185.220.101.4', country: 'Germany', code: 'DE' },
  { ip: '45.33.22.11', country: 'United States', code: 'US' },
  { ip: '103.22.11.4', country: 'China', code: 'CN' },
  { ip: '194.223.11.20', country: 'Russia', code: 'RU' },
  { ip: '52.132.6.22', country: 'Netherlands', code: 'NL' },
  { ip: '192.168.1.105', country: 'Local Network', code: 'Local' }
];

const mockEvents = [
  {
    category: 'auth',
    severity: 'warning',
    message: 'SSH Brute force attempt detected (5 failed attempts within 10s) on user: root',
    parsedDetails: { port: 22, app: 'sshd', user: 'root' }
  },
  {
    category: 'auth',
    severity: 'critical',
    message: 'Multiple failed administrative login attempts on console portal',
    parsedDetails: { port: 443, app: 'nginx-auth', user: 'administrator' }
  },
  {
    category: 'firewall',
    severity: 'info',
    message: 'Inbound packet dropped: ICMP Echo Request from blacklisted subnet',
    parsedDetails: { protocol: 'ICMP', rule: 'BLOCK_BL_SUBNET' }
  },
  {
    category: 'firewall',
    severity: 'warning',
    message: 'Port scan signature detected (ports 21, 22, 23, 80, 443 targeted)',
    parsedDetails: { protocol: 'TCP', scanType: 'SYN' }
  },
  {
    category: 'firewall',
    severity: 'critical',
    message: 'SQL Injection signature detected in URI parameter: id=1%20OR%201=1',
    parsedDetails: { protocol: 'HTTP', target: '/api/v1/products', method: 'GET' }
  },
  {
    category: 'malware',
    severity: 'critical',
    message: 'Malware file Trojan.Generic.Downloader blocked by Endpoint Agent',
    parsedDetails: { hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', file: 'mimikatz.exe' }
  },
  {
    category: 'malware',
    severity: 'warning',
    message: 'Outbound traffic to known malicious command & control (C2) server',
    parsedDetails: { domain: 'c2-server.darknet-bot.xyz', port: 8080 }
  },
  {
    category: 'system',
    severity: 'info',
    message: 'System backup service completed successfully: 24.5 GB archived to cloud storage',
    parsedDetails: { service: 'aws-s3-backup', durationSec: 345 }
  },
  {
    category: 'system',
    severity: 'error',
    message: 'High disk queue length on databases partition /dev/sda2: usage exceeds 92%',
    parsedDetails: { partition: '/dev/sda2', ioWaitPct: 42 }
  }
];

// Helper to seed initial data
const seedInitialData = async () => {
  try {
    // 1. Seed admin user
    const adminExists = await User.findOne({ email: 'admin@hackersafe.com' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@hackersafe.com',
        password: 'adminpassword123',
        role: 'admin',
      });
      console.log('[SEED] Default admin user created: admin@hackersafe.com / adminpassword123');
    }

    // 2. Clear old logs/alerts if empty
    const logCount = await Log.countDocuments({});
    if (logCount === 0) {
      console.log('[SEED] Log database is empty. Generating historic syslog records...');
      
      const logsToInsert = [];
      const alertsToInsert = [];
      
      // Let's generate 60 past records spanning the last 2 hours
      const now = new Date();
      for (let i = 60; i > 0; i--) {
        const timeOffset = i * 2 * 60 * 1000; // 2 minutes apart
        const logTime = new Date(now.getTime() - timeOffset);
        
        const ipObj = mockIPs[Math.floor(Math.random() * mockIPs.length)];
        const host = mockHosts[Math.floor(Math.random() * mockHosts.length)];
        const eventTemplate = mockEvents[Math.floor(Math.random() * mockEvents.length)];

        logsToInsert.push({
          timestamp: logTime,
          sourceIP: ipObj.ip,
          hostname: host,
          severity: eventTemplate.severity,
          category: eventTemplate.category,
          message: eventTemplate.message,
          parsedDetails: {
            ...eventTemplate.parsedDetails,
            country: ipObj.country,
            countryCode: ipObj.code,
            seed: true
          }
        });

        // Trigger alert for critical historic logs
        if (eventTemplate.severity === 'critical' && Math.random() > 0.4) {
          alertsToInsert.push({
            title: `${eventTemplate.category.toUpperCase()} Threat Registered`,
            description: eventTemplate.message,
            severity: 'critical',
            status: Math.random() > 0.5 ? 'resolved' : 'open',
            sourceIP: ipObj.ip,
            createdAt: logTime,
            resolvedAt: Math.random() > 0.5 ? new Date(logTime.getTime() + 15 * 60 * 1000) : undefined,
            assignedTo: Math.random() > 0.5 ? 'admin' : 'Unassigned',
          });
        }
      }

      await Log.insertMany(logsToInsert);
      await Alert.insertMany(alertsToInsert);
      console.log(`[SEED] Successfully seeded ${logsToInsert.length} log events and ${alertsToInsert.length} security alerts.`);
    }
  } catch (error) {
    console.error(`[SEED] Error seeding database: ${error.message}`);
  }
};

// Real-time cybersecurity logs background simulator
const startLogSimulation = () => {
  console.log('[SIMULATOR] Starting HackerSafe cybersecurity live stream simulation...');

  setInterval(async () => {
    try {
      const ipObj = mockIPs[Math.floor(Math.random() * mockIPs.length)];
      const host = mockHosts[Math.floor(Math.random() * mockHosts.length)];
      const eventTemplate = mockEvents[Math.floor(Math.random() * mockEvents.length)];

      const freshLog = await Log.create({
        timestamp: new Date(),
        sourceIP: ipObj.ip,
        hostname: host,
        severity: eventTemplate.severity,
        category: eventTemplate.category,
        message: eventTemplate.message,
        parsedDetails: {
          ...eventTemplate.parsedDetails,
          country: ipObj.country,
          countryCode: ipObj.code,
          simulated: true
        }
      });

      // Broadcast fresh log over WebSocket
      const io = getIO();
      if (io) {
        io.emit('new-log', freshLog);
      }

      // 10% chance to generate alerts on general logs, but 100% on critical/error logs
      if (freshLog.severity === 'critical' || freshLog.severity === 'error') {
        const isCritical = freshLog.severity === 'critical';
        const freshAlert = await Alert.create({
          title: `${freshLog.category.toUpperCase()} Threat Detected`,
          description: freshLog.message,
          severity: isCritical ? 'critical' : 'high',
          status: 'open',
          sourceIP: freshLog.sourceIP,
          createdAt: new Date(),
        });

        // Broadcast alert over WebSocket
        if (io) {
          io.emit('new-alert', freshAlert);
        }
      }
    } catch (err) {
      console.error(`[SIMULATOR] Error generating mock cyber event: ${err.message}`);
    }
  }, 4000); // Trigger a new log event every 4 seconds to animate graphs
};

module.exports = { seedInitialData, startLogSimulation };
