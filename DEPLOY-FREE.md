# HackerSafe — 100% Free Live Deploy (Render + MongoDB Atlas)

Frontend aur backend **dono** free par chalenge. Domains:

| Service | Free URL |
|---------|----------|
| Dashboard | `https://hackersafe-web.onrender.com` |
| API | `https://hackersafe-api.onrender.com` |

(Render deploy ke baad apna naam change kar sakte ho: **Settings → Name**)

---

## Step 1 — Free MongoDB (Atlas)

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → free account
2. **Create** → **M0 FREE** cluster
3. **Database Access** → user + password banao
4. **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`)
5. **Connect** → **Drivers** → connection string copy karo:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/hackersafe?retryWrites=true&w=majority
```

`PASSWORD` mein special chars ho to URL-encode karo.

---

## Step 2 — GitHub repo

**Your repo:** [https://github.com/Programmerheck/Hacksafe-](https://github.com/Programmerheck/Hacksafe-)

Latest local changes push karo:

```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

---

## Step 3 — Render par deploy (dono services ek saath)

**Quick:** [Deploy to Render (this repo)](https://render.com/deploy?repo=https://github.com/Programmerheck/Hacksafe-)

Ya manually:

1. [dashboard.render.com](https://dashboard.render.com) → sign up (free)
2. **New +** → **Blueprint**
3. Repo **Programmerheck/Hacksafe-** select karo → `render.yaml` auto-detect
4. **`MONGODB_URI`** paste karo (Atlas string)
5. **Apply** → deploy start (10–15 min pehli baar)

Deploy complete hone par:

- **Frontend:** `https://hackersafe-web.onrender.com`
- **Backend health:** `https://hackersafe-api.onrender.com/health`

**Login:** `admin@hackersafe.com` / `adminpassword123`

---

## Step 4 — Custom free subdomain naam (optional)

Har service par: **Settings** → change name, e.g. `hackersafe` → URL `https://hackersafe.onrender.com`

---

## Railway (alternative)

Same repo, **2 services** banao:

| Service | Root folder | Start | Env |
|---------|-------------|-------|-----|
| API | `backend` | `npm start` | `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `DISABLE_SYSLOG=true`, `FRONTEND_URL=https://YOUR-FRONTEND.up.railway.app` |
| Web | `frontend` | `npm start` | `NEXT_PUBLIC_API_URL=https://YOUR-API.up.railway.app` |

Build frontend: `npm install && npm run build`

WebSocket URL auto `wss://` ban jata hai API URL se (code mein set hai).

---

## Notes

- **Free tier sleep:** 15 min inactive → pehli request 30–60 sec slow (cold start)
- **UDP Syslog (514):** cloud par band hai (`DISABLE_SYSLOG=true`); baaki SIEM features chalte hain
- **Login fail?** Check `NEXT_PUBLIC_API_URL` frontend par aur Atlas IP whitelist
