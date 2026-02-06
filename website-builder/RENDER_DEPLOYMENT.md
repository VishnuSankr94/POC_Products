# Render Deployment Guide - Step by Step

Complete guide for deploying your website builder backend to Render.

## Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Your repository pushed to GitHub

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

Your `render.yaml` is already configured! It's in the project root and will be auto-detected by Render.

### Step 2: Sign In to Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"** or **"Sign In"**
3. Sign in with your GitHub account

### Step 3: Create a New Web Service

1. Click the **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub account if prompted
4. Find and select your `website-builder` repository
5. Click **"Connect"**

### Step 4: Configure Build Settings

Render will auto-detect settings from `render.yaml`, but verify these:

**Basic Settings:**
- **Name**: `website-builder-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server` ⚠️ **IMPORTANT**
- **Runtime**: `Node`
- **Build Command**: `npm install` (or leave empty, Render will auto-detect)
- **Start Command**: `npm start`

**Advanced Settings:**
- Scroll down to **"Advanced"** section
- **Auto-Deploy**: `Yes` (deploys on every push to main branch)

### Step 5: Configure Persistent Disk (CRITICAL)

Your app saves generated websites to the `websites/` directory. Render requires explicit persistent disk configuration:

1. Scroll to **"Advanced"** section
2. Find **"Persistent Disk"**
3. Click **"Add Persistent Disk"**
4. Configure:
   - **Name**: `websites-storage`
   - **Mount Path**: `/opt/render/project/src/websites`
   - **Size**: `1 GB` (or more if you expect many sites)
5. Click **"Save"**

**Important**: Without persistent disk, all generated websites will be lost on every deployment!

### Step 6: Set Environment Variables

1. Scroll to **"Environment Variables"** section
2. Click **"Add Environment Variable"** for each:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | Already in render.yaml |
   | `OPENAI_API_KEY` | `your-openai-key` | If using OpenAI |
   | `ANTHROPIC_API_KEY` | `your-anthropic-key` | If using Anthropic |
   | `GROQ_API_KEY` | `your-groq-key` | If using Groq |
   | `GEMINI_API_KEY` | `your-gemini-key` | If using Gemini |

3. **Don't set `PORT`** - Render auto-sets this

### Step 7: Update Server Code for Render Persistent Disk

The server needs a small update to use Render's persistent disk path. Update `server/index.js`:

**Current code (line 34):**
```js
const websitesDir = path.join(__dirname, '..', 'websites');
```

**Update to:**
```js
// Use Render's persistent disk if available, otherwise use relative path
const websitesDir = process.env.RENDER 
  ? path.join('/opt/render/project/src', 'websites')
  : path.join(__dirname, '..', 'websites');
```

This ensures files are saved to the persistent disk on Render.

### Step 8: Deploy

1. Review all settings
2. Click **"Create Web Service"**
3. Render will:
   - Clone your repository
   - Install dependencies (`npm install` in `server/` directory)
   - Start your server (`npm start`)
4. Watch the build logs in real-time
5. Wait for deployment to complete (usually 2-5 minutes)

### Step 9: Get Your Backend URL

1. Once deployed, you'll see a green "Live" status
2. Your service URL will be displayed (e.g., `website-builder-backend.onrender.com`)
3. **Copy this URL** - you'll need it for frontend configuration

### Step 10: Test Your Backend

Test the health endpoint:

```bash
curl https://website-builder-backend.onrender.com/api/health
```

Expected response:
```json
{"ok":true}
```

Test provider availability:
```bash
curl https://website-builder-backend.onrender.com/api/sites/availability
```

### Step 11: Update Frontend Configuration

Update `netlify.toml` with your Render backend URL:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://website-builder-backend.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/preview/*"
  to = "https://website-builder-backend.onrender.com/preview/:splat"
  status = 200
  force = true
```

Or set environment variable in Netlify:
- `VITE_API_URL` = `https://website-builder-backend.onrender.com`

## Render-Specific Features

### Auto-Deploy

Render automatically deploys when you push to your main branch. You can:
- Disable auto-deploy in service settings
- Deploy manually by clicking "Manual Deploy" → "Deploy latest commit"

### Logs

View real-time logs:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. See live server logs, errors, and console output

### Metrics

Monitor your service:
- **Metrics** tab shows CPU, memory, and request metrics
- **Events** tab shows deployment history

### Custom Domain

Add a custom domain:
1. Go to **Settings** → **Custom Domains**
2. Add your domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

**Error**: `Cannot find module`
- **Solution**: Ensure Root Directory is set to `server`
- Check that `package.json` exists in `server/` directory

**Error**: `npm install` fails
- **Solution**: Check Node.js version compatibility
- Render uses Node 18+ by default (should work)

### Server Won't Start

**Error**: `Port already in use`
- **Solution**: Don't set PORT manually - Render sets it automatically
- Your code already uses `process.env.PORT || 3000` ✅

**Error**: `Cannot find websites directory`
- **Solution**: Ensure persistent disk is mounted correctly
- Check mount path: `/opt/render/project/src/websites`
- Verify server code uses Render path when `process.env.RENDER` is set

### Files Not Persisting

**Problem**: Generated websites disappear after deployment
- **Solution**: Ensure persistent disk is configured
- Verify mount path matches server code
- Check disk size (may need to increase if full)

### CORS Errors

**Problem**: Frontend can't connect to backend
- **Solution**: Backend already has `cors()` enabled
- If issues persist, update CORS in `server/index.js`:
```js
app.use(cors({
  origin: [
    'https://your-netlify-site.netlify.app',
    'http://localhost:5173' // for local dev
  ],
  credentials: true
}));
```

### Slow Cold Starts

**Problem**: First request after inactivity is slow
- **Explanation**: Render spins down inactive free tier services
- **Solution**: 
  - Upgrade to paid plan for always-on service
  - Or use a cron job to ping your service every 5 minutes

## Render Free Tier Limitations

- **Spins down** after 15 minutes of inactivity (cold starts)
- **750 hours/month** of runtime (enough for always-on on one service)
- **Persistent disk** available ✅
- **Custom domains** supported ✅

## Updating Your Deployment

### Automatic Updates

Just push to your main branch - Render auto-deploys!

### Manual Updates

1. Go to your service dashboard
2. Click **"Manual Deploy"**
3. Select branch/commit
4. Click **"Deploy"**

### Rollback

1. Go to **"Events"** tab
2. Find previous successful deployment
3. Click **"Redeploy"**

## Cost Estimation

**Free Tier:**
- ✅ Perfect for development/testing
- ✅ 750 hours/month (enough for always-on)
- ⚠️ Spins down after inactivity

**Starter Plan ($7/month):**
- Always-on service
- No cold starts
- Better for production

## Next Steps

1. ✅ Backend deployed to Render
2. ✅ Backend URL copied
3. ✅ `netlify.toml` updated with backend URL
4. ✅ Frontend deployed to Netlify
5. ✅ Test full integration

## Quick Reference

**Service URL Format:**
```
https://your-service-name.onrender.com
```

**Health Check:**
```
https://your-service-name.onrender.com/api/health
```

**Persistent Disk Path:**
```
/opt/render/project/src/websites
```

**Environment Variable Check:**
Render sets `RENDER=1` automatically - use this to detect Render environment.

---

Need help? Check Render docs: [render.com/docs](https://render.com/docs)
