# 🛡️ HackerSafe: SPLUNK-Style Cybersecurity SIEM Platform

HackerSafe is a modern, enterprise-grade, Splunk-style SIEM (Security Information and Event Management) platform featuring a hacker-style dark cockpit UI, real-time log ingestion over UDP Syslog ports, REST API endpoints, real-time WebSockets streaming, and deep pattern threat analytics.

## 🔗 Links

| | URL |
|---|-----|
| **GitHub** | [github.com/Programmerheck/Hacksafe-](https://github.com/Programmerheck/Hacksafe-) |
| **Live dashboard** | [hackersafe-web.onrender.com](https://hackersafe-web.onrender.com) *(after [Render deploy](https://render.com/deploy?repo=https://github.com/Programmerheck/Hacksafe-))* |
| **API** | [hackersafe-api.onrender.com](https://hackersafe-api.onrender.com) |
| **All share links** | [SHARE-LINKS.md](./SHARE-LINKS.md) |

**Demo login:** `admin@hackersafe.com` / `adminpassword123`

---

## 🚀 Key Features

* **Futuristic Dark-Mode UI**: Built with glassmorphism panels, customized glowing boundary borders (red/yellow/green indicators), and high-performance Framer Motion animation layouts.
* **Real-Time Log Streamer**: Standard WebSocket subscription feeds that stream parsed syslog telemetry directly into monospace active terminals on user screens.
* **Integrated Syslog Engine**: Active UDP Port `514` daemon that ingests logs from external systems (like Kali Linux) and parses them on the fly.
* **Sandbox Simulation Deck**: Inside `/settings`, operators can click threat triggers to simulate database injections, Trojans, SSH credential sweeps, and network scans.
* **Alert Resolution Control**: Cyber operations center supporting incident resolution logs, assignments, and real-time state broadcasts.
* **Attack Lifecycle Timeline**: Multi-stage Framer Motion kill-chain timeline analyzing reconnaissance, sweeps, scans, gain access, and exfiltration points.
* **Deep Analytics and Geospatial Mapping**: Recharts bandwidth trends, authentication attempt histogram, malware categorizations, and custom interactive SVG map tracking.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS v4, Recharts, Framer Motion, Lucide Icons, jwt-decode.
* **Backend**: Node.js, Express, MongoDB (Mongoose), Native HTTP WebSocket integration, Datagram (`dgram`) UDP sockets.
* **Packaging**: Docker, Docker Compose.

---

## ⚙️ Project Folder Architecture

```
splunk/
├── backend/                  # Node.js Express Core + WebSockets + Syslog Engine
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── models/           # Mongoose Event Schemas (User, Log, Alert)
│   │   ├── middleware/       # JWT Auth Guards & Rate limiters
│   │   ├── controllers/      # Query aggregators & action handlers
│   │   ├── routes/           # REST endpoints mapping
│   │   └── services/         # WebSockets, UDP Syslog server & seed simulators
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Next.js App Router Client Dashboard
│   ├── src/
│   │   ├── app/              # Dashboard pages (login, logs, alerts, analytics, settings)
│   │   ├── components/       # Collapsible Sidebar & Navbar clock dropdown
│   │   ├── hooks/            # Context state wrappers (useAuth, useSocket)
│   │   └── utils/            # JWT decoders & CSV exporters
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml        # Multi-container cluster configuration
```

---

## 🏎️ Rapid Setup (Using Docker Compose)

The easiest way to boot the full MongoDB + Backend + Frontend stack in one click:

```bash
# Clone or navigate to the directory
cd splunk

# Spin up the containers
docker-compose up --build
```
Once initialized:
* **HackerSafe Dashboard Portal**: `http://localhost:3000`
* **Express SIEM REST & Sockets Backend**: `http://localhost:5000`
* **UDP Syslog Ingestion Listener**: `udp://localhost:514`

---

## 💻 Manual Local Development Setup

### Prerequisite Setup
Ensure you have **Node.js v18+** and a running instance of **MongoDB** (`mongodb://localhost:27017`) on your development system.

### 1. Launch the Backend Core
```bash
cd backend
npm install
npm run dev
```
* The server will automatically connect to MongoDB, seed credentials (`admin@hackersafe.com` / `adminpassword123`), and start simulating logs every 4 seconds.

### 2. Launch the Next.js Client
```bash
cd ../frontend
npm install
npm run dev
```
* Open `http://localhost:3000` inside your browser. Log in with the sandbox credentials.

---

## 📡 External Kali Linux Ingestion Triggers

HackerSafe listens for raw syslogs over UDP Port `514`. You can feed logs from your external security engines:

### Option A: Standard Linux `logger` CLI
```bash
logger -n <siem-ip> -P 514 --rfc5424 "auth nginx brute force attempt on root from 103.22.11.4"
```

### Option B: Netcat UDP injection pipe
```bash
echo "<34>1 2026-05-22T08:00:00Z kali-os malware - - Trojan payload mimicking mimikatz.exe blocked" | nc -u -w1 <siem-ip> 514
```

---

## 🌐 Production Deployment Guide

### 1. Deploying Frontend to Vercel
Vercel is optimal for rendering Next.js pages.
1. Install Vercel CLI or link your repository to the Vercel dashboard.
2. Configure **Environment Variables** in Vercel settings:
   * `NEXT_PUBLIC_API_URL`: URL of your deployed backend REST API.
   * `NEXT_PUBLIC_WS_URL`: WebSocket URL (`wss://<your-backend-domain>`).
3. Deploy the Next.js app:
```bash
cd frontend
vercel --prod
```

### 2. Deploying Backend to Render / Railway
Render and Railway provide seamless hosting for Express servers.

#### For Railway:
1. Initialize a new Railway project and link the repository.
2. Add a **MongoDB plugin** or provide `MONGODB_URI` from a hosted Atlas cluster.
3. Bind variables:
   * `PORT`: `5000`
   * `JWT_SECRET`: A secure crypt string.
   * `MONGODB_URI`: Link to database.
   * `NODE_ENV`: `production`
4. Deploy. Railway automatically reads the `backend/package.json` if targeted.

### 3. VPS Ubuntu Server Deployment (Production Grade)
To host HackerSafe on a dedicated Ubuntu server:

#### A. Install Node, MongoDB & PM2
```bash
# Update and install tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm mongodb

# Install PM2 Process Manager globally
sudo npm install -y -g pm2
```

#### B. Setup Nginx Reverse Proxy
Install Nginx to handle SSL and reverse proxy traffic to Node (5000) and Next (3000).
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/hackersafe
```

Paste Nginx server block configuring HTTP / Websockets upgrades:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend Route
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API & WebSocket Route
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Link and enable the server:
```bash
sudo ln -s /etc/nginx/sites-available/hackersafe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### C. Launch Processes using PM2
Deploy code, customize `.env` files in both directories, build the Next.js frontend, and spin up server daemons:
```bash
# Boot Express Backend
cd splunk/backend
npm install
pm2 start src/server.js --name hs-backend

# Build & Boot Next.js Frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name hs-frontend -- start

# Save PM2 process lists to launch on reboot
pm2 save
pm2 startup
```
Your SIEM platform is fully operational and shielded in production!
