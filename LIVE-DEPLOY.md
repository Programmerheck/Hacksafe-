# 🚀 HackerSafe LIVE karo (15 minute guide)

Repo: [github.com/Programmerheck/Hacksafe-](https://github.com/Programmerheck/Hacksafe-)

---

## PART A — MongoDB Atlas (5 min)

1. Kholo: **https://www.mongodb.com/cloud/atlas/register**
2. **Build a Database** → **M0 FREE** → region koi bhi → Create
3. **Database Access** → **Add New Database User**
   - Username: `hackersafe`
   - Password: strong password (save karo)
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. **Database** → **Connect** → **Drivers** → Node.js
6. Connection string copy karo, example:

```
mongodb+srv://hackersafe:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hackersafe?retryWrites=true&w=majority
```

- `YOUR_PASSWORD` = apna password (agar `@` hai to `%40` likho)
- Database name `hackersafe` rakho

**Is string ko save karo — Render par paste karni hai.**

---

## PART B — Render par deploy (10 min)

1. Kholo: **https://render.com/deploy?repo=https://github.com/Programmerheck/Hacksafe-**
2. **GitHub** se login → repo **Hacksafe-** allow karo
3. Blueprint screen par **`MONGODB_URI`** field mein Atlas wala string **paste** karo
4. **Apply** click karo
5. Wait **10–20 minutes** (dono services build hongi)

### Deploy success check

| Test | URL |
|------|-----|
| API | https://hackersafe-api.onrender.com/health → `"status":"ONLINE"` |
| App | https://hackersafe-web.onrender.com/login |

**Login:** `admin@hackersafe.com` / `adminpassword123`

---

## PART C — Agar login fail ho

1. Render → **hackersafe-web** → **Environment** → check:
   - `NEXT_PUBLIC_API_URL` = `https://hackersafe-api.onrender.com`
2. **hackersafe-api** → **Environment** → check:
   - `MONGODB_URI` = Atlas string (sahi password)
   - `FRONTEND_URL` = `https://hackersafe-web.onrender.com`
3. Dono services par **Manual Deploy** → **Deploy latest commit**

---

## Share links (live)

```
🛡️ HackerSafe SIEM — LIVE
🌐 https://hackersafe-web.onrender.com
📂 https://github.com/Programmerheck/Hacksafe-
🔐 admin@hackersafe.com / adminpassword123
```

> Free tier: 15 min inactive ke baad pehli load **30–60 sec** slow ho sakti hai.
