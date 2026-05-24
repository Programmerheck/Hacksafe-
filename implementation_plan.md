# Implementation Plan - HackerSafe SIEM Platform

HackerSafe is a modern, enterprise-grade, Splunk-style SIEM (Security Information and Event Management) cybersecurity monitoring dashboard. It features a hacker-style dark UI with rich aesthetics, real-time log streaming over WebSockets, comprehensive attack analytics, dynamic charts, syslog ingestion from external devices (like Kali Linux), a secure role-based JWT authentication system, and an alert management engine.

---

## User Review Required

> [!IMPORTANT]
> **Aesthetic Design and Framework Choices**
> 
> * **Name**: Instead of Splunk, the entire app will be branded as **HackerSafe**.
> * **Frontend**: Next.js (with App Router, React, Tailwind CSS, Framer Motion, Recharts, Lucide Icons) for high-performance rendering and futuristic dark-mode UI.
> * **Backend**: Node.js + Express + MongoDB for metadata and log archival, integrated with custom WebSocket and UDP syslog listeners.
> * **Security & Authentication**: JWT authentication with cookies or auth headers, supporting `admin` and `user` roles. Password hashing with bcrypt. Rate limiting, Helmet security headers.

---

## Proposed System Architecture

The project will be structured in a monorepo-style setup at the root folder:
```
splunk/
├── backend/                  # Node.js + Express API + WebSockets + Syslog server
│   ├── src/
│   │   ├── config/           # DB and env configuration
│   │   ├── models/           # Mongoose schemas (User, Log, Alert, Analytics)
│   │   ├── middleware/       # Auth guard, rate limiters, error handler
│   │   ├── controllers/      # Route controllers for authentication, logs, alerts
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # WebSockets, Syslog parser, Email simulator
│   │   └── server.js         # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Next.js App Router UI
│   ├── src/
│   │   ├── app/              # App router (login, signup, dashboard, logs, alerts, analytics, settings)
│   │   ├── components/       # Reusable components (Sidebar, Navbar, Widgets, LogTable, AlertPanel, Charts)
│   │   ├── hooks/            # Custom hooks (useSocket, useAuth, useLogs)
│   │   └── utils/            # Helper functions (formatting, exports, auth)
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # Orchestrates Backend, Frontend, and MongoDB
└── README.md                 # Deployment & setup documentation
```

---

## Proposed Changes

### Component 1: The Backend (Node.js + Express + MongoDB + WebSockets)

We will build an Express server that handles:
- **JWT Auth**: SignUp, LogIn, Auth session validation, role checks (`admin` and `user`).
- **Syslog Ingestion**: Ingest standard Syslogs over UDP port `514` (standard syslog port, adjustable) or a REST endpoint `/api/logs/ingest`. Ingested logs are parsed for severity, timestamp, source IP, message, and category.
- **WebSocket Broadcast**: A WebSocket server (`ws://localhost:5000`) broadcasting real-time logs and alerts to connected SIEM frontends.
- **Log / Alert Storage**: MongoDB stores log history, alerts, and user profiles. We'll pre-populate it with realistic seed data of security events (brute force attacks, port scans, firewall blockages, malware detection).
- **Email Alerts**: Mocked or integration-ready email alerts service when critical threats (Severity: High/Critical) are logged.

#### [NEW] [backend/package.json](file:///d:/web%20development/splunk/backend/package.json)
Contains core dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `ws`, `helmet`, `express-rate-limit`.

#### [NEW] [backend/src/server.js](file:///d:/web%20development/splunk/backend/src/server.js)
Sets up Express, WebSocket server, Syslog UDP server, and initializes DB connections.

#### [NEW] [backend/src/config/db.js](file:///d:/web%20development/splunk/backend/src/config/db.js)
MongoDB connection setup via Mongoose.

#### [NEW] [backend/src/models/User.js](file:///d:/web%20development/splunk/backend/src/models/User.js)
Mongoose Schema: fields `username`, `email`, `password` (hashed), `role` (`admin`, `user`), and `createdAt`.

#### [NEW] [backend/src/models/Log.js](file:///d:/web%20development/splunk/backend/src/models/Log.js)
Mongoose Schema for ingested events: `timestamp`, `sourceIP`, `hostname`, `severity` (`info`, `warning`, `error`, `critical`), `message`, `category` (`firewall`, `auth`, `malware`, `system`), and `parsedDetails`.

#### [NEW] [backend/src/models/Alert.js](file:///d:/web%20development/splunk/backend/src/models/Alert.js)
Mongoose Schema for alerts: `title`, `description`, `severity` (`low`, `medium`, `high`, `critical`), `status` (`open`, `resolved`), `sourceIP`, `createdAt`, `resolvedAt`, `assignedTo`.

#### [NEW] [backend/src/middleware/auth.js](file:///d:/web%20development/splunk/backend/src/middleware/auth.js)
JWT token verifier middleware, verifying roles for admin pages.

#### [NEW] [backend/src/middleware/rateLimiter.js](file:///d:/web%20development/splunk/backend/src/middleware/rateLimiter.js)
Express rate limit setup for auth and ingestion endpoints.

#### [NEW] [backend/src/services/syslogServer.js](file:///d:/web%20development/splunk/backend/src/services/syslogServer.js)
UDP Syslog receiver on port 514 (standard syslog). Also parses logs (RFC 5424 or RFC 3164) and triggers live logs and threat alerts.

#### [NEW] [backend/src/services/websocketService.js](file:///d:/web%20development/splunk/backend/src/services/websocketService.js)
Manages client WebSocket connections, broadcasting security events, alerts, and system stats.

#### [NEW] [backend/src/services/emailService.js](file:///d:/web%20development/splunk/backend/src/services/emailService.js)
Simulated email alerting service (Nodemailer setup) that prints to console / triggers mock emails on critical intrusions.

---

### Component 2: The Frontend (Next.js App Router + Tailwind + Recharts + Framer Motion)

We will build a futuristic, high-performance cybersecurity SIEM dashboard under **HackerSafe**.
Key pages to create:
1. **Login & Signup Page (`/login`, `/signup`)**: Cybersecurity cyber-themed modern pages with animated nodes, cyber grids, and clean forms.
2. **Dashboard Overview (`/dashboard`)**: The central cockpit showing real-time stats:
   - Stats cards: Total Events, Active Threats, Failed Logins, CPU/Network loads.
   - Live stream mini-terminal showing real-time logs blinking in green/yellow/red.
   - Attack trends line-chart (recharts), malware detection doughnut-chart.
3. **Logs Viewer (`/logs`)**: Advanced terminal-style log investigator with filters (Severity, Category, Source IP, full-text search), auto-scroll, real-time pause/resume, and "Export to CSV" capability.
4. **Alerts Center (`/alerts`)**: Threat response board showing active intrusions (Brute Force, SQL Injection, DDoS, Trojan detected). Admins can mark alerts as "Resolved" in real-time. Includes an interactive Attack Timeline.
5. **Analytics (`/analytics`)**: Deep data view with larger interactive graphs:
   - Geolocation attack map (stylized SVG canvas or stylized country tracker representing source IPs).
   - Network throughput and latency charts.
   - Login attempts over time (Brute force analyzer).
6. **Settings & Admin Panel (`/settings`)**: Admin permissions management, simulated Kali Linux syslog configuration endpoints, and alert notification configurations.

We'll use Tailwind with custom animations, deep space backgrounds, glowing cyan/purple borders, and absolute visual precision.

#### [NEW] [frontend/package.json](file:///d:/web%20development/splunk/frontend/package.json)
Tailwind CSS, framer-motion, recharts, lucide-react, socket.io-client / standard WebSocket, jwt-decode.

#### [NEW] [frontend/tailwind.config.ts](file:///d:/web%20development/splunk/frontend/tailwind.config.ts)
Adds specific terminal fonts, cybercolors (dark theme `#0B0F19`, `#1E293B`, and glowing green `#10B981`, cyber cyan `#06B6D4`, alert red `#EF4444`, security warning orange `#F59E0B`).

#### [NEW] [frontend/src/components/Sidebar.tsx](file:///d:/web%20development/splunk/frontend/src/components/Sidebar.tsx)
Collapsible, smooth animated cybersecurity sidebar with modern active state transitions.

#### [NEW] [frontend/src/components/Navbar.tsx](file:///d:/web%20development/splunk/frontend/src/components/Navbar.tsx)
Top navigation with real-time system clock, search bar, active user role avatar, and a real-time notification drop-down for new critical alerts.

#### [NEW] [frontend/src/components/TerminalLogs.tsx](file:///d:/web%20development/splunk/frontend/src/components/TerminalLogs.tsx)
Futuristic monospace hacker terminal displaying live streaming logs, complete with pausing, auto-scroll, clear, and severity filters.

#### [NEW] [frontend/src/components/AttackTimeline.tsx](file:///d:/web%20development/splunk/frontend/src/components/AttackTimeline.tsx)
Framer-motion vertical timeline showing the chronologically mapped stages of an attack (Reconnaissance -> Scanning -> Intrusion -> Exfiltration).

---

### Component 3: Integration and Docker support

We'll provide absolute ease of setup using a multi-stage `Dockerfile` for both frontend and backend and a single `docker-compose.yml` that sets up the database, backend services (REST/WebSockets/UDP Syslog), and Next.js.

#### [NEW] [docker-compose.yml](file:///d:/web%20development/splunk/docker-compose.yml)
Starts standard Mongo container, backend app (binding UDP 514 and Express/WebSocket port 5000), and Next.js frontend (port 3000).

#### [NEW] [README.md](file:///d:/web%20development/splunk/README.md)
Exemplary README documentation showing Vercel, Render, Railway, and VPS server installation scripts.

---

## Verification Plan

### Automated / Manual Integration Test
- **Auth Flow**: Register `admin@hackersafe.com` and `analyst@hackersafe.com`, verify JWT cookie generation, protected route middleware blocking unauthenticated traffic, and role restrictions.
- **Syslog Ingest & WebSocket Broadcast**: Run a Python script or Netcat command sending mock Syslog logs to UDP Port `514` or REST API `POST /api/logs/ingest` and verify they immediately render on the dashboard's TerminalLogs component in real-time.
- **Alert Resolution**: Click "Resolve Alert" in frontend, check database state update via Network inspection, and confirm alert status flips from open to resolved in real-time for all connected administrators.
- **Log Export**: Click "Export CSV" and verify download of parsed log database content.

### Local Environment Verification
- We'll run the backend and frontend locally, and use a browser subagent or verify outputs to ensure the application starts and renders correctly.
