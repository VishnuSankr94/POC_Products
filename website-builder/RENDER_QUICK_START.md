# Render Quick Start Guide

## 🚀 Deploy in 5 Minutes

### 1. Sign Up & Connect
- Go to [render.com](https://render.com)
- Sign in with GitHub
- Click **"New +"** → **"Web Service"**
- Connect your repository

### 2. Configure Service
- **Name**: `website-builder-backend`
- **Root Directory**: `server` ⚠️ **CRITICAL**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Add Persistent Disk ⚠️ **REQUIRED**
- Scroll to **"Advanced"**
- Click **"Add Persistent Disk"**
- **Mount Path**: `/opt/render/project/src/websites`
- **Size**: `1 GB`

### 4. Add Environment Variables
Add these in the **"Environment Variables"** section:
- `OPENAI_API_KEY` (if using)
- `ANTHROPIC_API_KEY` (if using)
- `GROQ_API_KEY` (if using)
- `GEMINI_API_KEY` (if using)

### 5. Deploy
- Click **"Create Web Service"**
- Wait for deployment (2-5 minutes)
- Copy your URL: `https://your-service.onrender.com`

### 6. Test
```bash
curl https://your-service.onrender.com/api/health
# Should return: {"ok":true}
```

### 7. Update Frontend
Update `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-service.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/preview/*"
  to = "https://your-service.onrender.com/preview/:splat"
  status = 200
  force = true
```

## ✅ Checklist

- [ ] Root Directory set to `server`
- [ ] Persistent disk configured
- [ ] Environment variables added
- [ ] Service deployed successfully
- [ ] Health check passes
- [ ] Frontend updated with backend URL

## ⚠️ Important Notes

1. **Persistent Disk is REQUIRED** - Without it, all generated websites will be lost on every deployment
2. **Root Directory MUST be `server`** - This tells Render where your backend code is
3. **Don't set PORT** - Render sets this automatically
4. **Cold Starts** - Free tier spins down after 15 min inactivity (first request may be slow)

## 🔧 Troubleshooting

**Build fails?**
- Check Root Directory is `server`
- Verify `package.json` exists in `server/`

**Files not persisting?**
- Verify persistent disk is mounted
- Check mount path matches: `/opt/render/project/src/websites`

**CORS errors?**
- Backend already has CORS enabled
- If issues persist, update CORS origins in `server/index.js`

---

For detailed instructions, see `RENDER_DEPLOYMENT.md`
