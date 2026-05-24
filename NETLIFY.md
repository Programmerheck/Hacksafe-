# Deploy HackerSafe to Netlify

Netlify hosts the **Next.js dashboard only**. The Express backend (API, WebSockets, UDP syslog) must run on another host.

## 1. Deploy frontend to Netlify

### Option A — Git (recommended)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Open [https://app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Select the repo.
4. Netlify reads `netlify.toml` at the repo root:
   - **Base directory:** `frontend` (set automatically)
   - **Build command:** `npm run build`
   - **Plugin:** `@netlify/plugin-nextjs`
5. Add **environment variables** (see below).
6. Click **Deploy site**.

### Option B — Netlify CLI

```bash
cd "d:\web development\splunk"
npx netlify-cli login
npx netlify-cli init
npx netlify-cli deploy --prod
```

## 2. Environment variables (required)

In **Site settings → Environment variables**, add:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://hackersafe-api.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | `wss://hackersafe-api.onrender.com` |

Redeploy after changing env vars.

## 3. Backend (required for login & live data)

Deploy `backend/` to Render, Railway, or a VPS. Set:

- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — long random string
- `PORT` — `5000` (or platform default)
- `NODE_ENV` — `production`

Use the public backend URL in the Netlify env vars above.

## 4. Custom domain on Netlify

### Netlify subdomain (free)

After deploy you get: `https://random-name.netlify.app`  
Rename in **Site settings → Domain management → Options → Edit site name**  
e.g. `hackersafe-siem.netlify.app`

### Your own domain (e.g. `dashboard.yourdomain.com`)

1. **Domain management** → **Add a domain** → enter your domain.
2. **Recommended:** Transfer DNS to Netlify or add records at your registrar:

| Type | Name | Value |
|------|------|--------|
| `CNAME` | `www` or subdomain | `your-site-name.netlify.app` |
| `A` | `@` (apex) | Netlify load balancer IPs (shown in dashboard) |

3. Enable **HTTPS** (Let’s Encrypt) — automatic once DNS propagates.

## 5. Verify

- Open your Netlify URL → `/login`
- Login: `admin@hackersafe.com` / `adminpassword123` (if backend seeded)
- If login fails, check `NEXT_PUBLIC_API_URL` and backend CORS/health.
