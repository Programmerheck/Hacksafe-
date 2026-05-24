const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { initWebSocket } = require('./services/websocketService');
const startSyslogServer = require('./services/syslogServer');
const { seedInitialData, startLogSimulation } = require('./services/seedData');

// Route files
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const alertRoutes = require('./routes/alertRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Connect to MongoDB database
connectDB().then(() => {
  // Pre-seed mock data and statistics
  seedInitialData().then(() => {
    // Launch background logs telemetry simulation
    startLogSimulation();
  });
});

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
initWebSocket(server);

// UDP syslog (disabled on Render/Railway — set DISABLE_SYSLOG=true)
if (process.env.DISABLE_SYSLOG !== 'true') {
  const syslogPort = process.env.SYSLOG_PORT || 514;
  startSyslogServer(syslogPort);
} else {
  console.log('[SYSLOG INGEST] Disabled (cloud deploy — UDP not supported on free hosts)');
}

// Security Middlewares
app.use(helmet());

const corsOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }
      callback(null, corsOrigins.includes(origin));
    },
    credentials: true,
  })
);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mounting REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'HackerSafe SIEM Core',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] Server Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal SIEM Core Server Error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SYSTEM ONLINE] HackerSafe Express Core active in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
