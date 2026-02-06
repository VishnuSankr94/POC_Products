# Quick Backend Deployment Guide

## 🚀 Railway (Fastest & Recommended)

### 1. Deploy
1. Go to [railway.app](https://railway.app) → Sign in with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. **Settings** → **Root Directory**: Set to `server`
5. **Variables** → Add your API keys:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` 
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
6. **Settings** → **Networking** → Generate domain
7. Copy your URL (e.g., `your-app.up.railway.app`)

### 2. Test
```bash
curl https://your-app.up.railway.app/api/health
# Should return: {"ok":true}
```

### 3. Update Frontend
Update `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-app.up.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/preview/*"
  to = "https://your-app.up.railway.app/preview/:splat"
  status = 200
  force = true
```

---

## 🌐 Render (Alternative)

### 1. Deploy
1. Go to [render.com](https://render.com) → Sign in with GitHub
2. **New +** → **Web Service**
3. Connect your repo
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables** → Add API keys
6. **Advanced** → Enable **Persistent Disk** (1GB)
7. Deploy

### 2. Test & Update
Same as Railway steps above.

---

## ✅ Checklist

- [ ] Backend deployed and accessible
- [ ] Health check returns `{"ok":true}`
- [ ] API keys set in platform dashboard
- [ ] Backend URL copied
- [ ] `netlify.toml` updated with backend URL
- [ ] Frontend deployed to Netlify
- [ ] Full integration tested

---

## 🔧 Troubleshooting

**CORS Errors?**
- Backend already has `cors()` enabled
- If issues persist, update `server/index.js`:
```js
app.use(cors({
  origin: ['https://your-netlify-site.netlify.app'],
  credentials: true
}));
```

**Port Issues?**
- Already handled: `process.env.PORT || 3000`
- Platform auto-sets PORT

**Storage Issues?**
- Railway: Persistent by default ✅
- Render: Enable Persistent Disk ✅
- Files stored in `websites/` directory

---

For detailed instructions, see `BACKEND_DEPLOYMENT.md`
