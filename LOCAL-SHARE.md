# Local share links (same Wi‑Fi / LAN)

## Start servers (share mode)

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev:lan
```

## Your share URLs (Wi‑Fi IP: 192.168.86.148)

| Kya | Link |
|-----|------|
| **Dashboard (doston ko bhejo)** | http://192.168.86.148:3000 |
| **Login** | http://192.168.86.148:3000/login |
| **API** | http://192.168.86.148:5000 |

**Login:** `admin@hackersafe.com` / `adminpassword123`

> Sirf **same Wi‑Fi** par. PC band ya servers stop = link kaam nahi karega.

## Copy-paste message

```
🛡️ HackerSafe SIEM
🔗 http://192.168.86.148:3000
📧 admin@hackersafe.com
🔑 adminpassword123
```

## Agar IP change ho

PowerShell: `ipconfig` → **Wi-Fi** IPv4 address  
Phir link: `http://YOUR-IP:3000`

## Firewall

Agar phone se open na ho: Windows Firewall → allow Node.js ports **3000** and **5000**.
