# Backend Deployment Guide

This guide covers deploying your Express backend server to various platforms.

## Overview

Your backend server:
- Express.js API server
- Uses ES modules (`type: "module"`)
- Requires file storage for generated websites (`websites/` directory)
- Needs environment variables for LLM API keys
- Handles file uploads (multer)

## Option 1: Railway (Recommended)

Railway is excellent for Node.js apps with persistent storage needs.

### Step 1: Prepare for Railway

1. **Create `railway.json`** (optional, for custom configuration):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Ensure `server/package.json` has a start script** (already present):
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect the Node.js project
6. **Important**: Set the **Root Directory** to `server`:
   - Go to Settings → Service Settings
   - Set Root Directory to `server`
7. Add environment variables:
   - Go to Variables tab
   - Add:
     - `OPENAI_API_KEY` (if using OpenAI)
     - `ANTHROPIC_API_KEY` (if using Anthropic)
     - `GROQ_API_KEY` (if using Groq)
     - `GEMINI_API_KEY` (if using Gemini)
   - Railway will auto-set `PORT` (don't override)
8. Deploy:
   - Railway will automatically build and deploy
   - Check the Deployments tab for logs
9. Get your URL:
   - Go to Settings → Networking
   - Generate a domain (e.g., `your-app.up.railway.app`)
   - Copy the URL

### Step 3: Update CORS (if needed)

Your server already has `cors()` enabled, which should work. If you encounter CORS issues, update `server/index.js`:

```js
app.use(cors({
  origin: ['https://your-netlify-site.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Step 4: Persistent Storage

Railway provides persistent storage by default. The `websites/` directory will persist across deployments.

**Note**: For production, consider using external storage (S3, etc.) if you need more reliability.

## Option 2: Render

Render is another great option for Node.js deployments.

### Step 1: Prepare for Render

Create `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: website-builder-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        sync: false  # Set manually in dashboard
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `website-builder-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - Scroll to "Environment Variables"
   - Add each API key:
     - `OPENAI_API_KEY`
     - `ANTHROPIC_API_KEY`
     - `GROQ_API_KEY`
     - `GEMINI_API_KEY`
6. **Important**: Enable persistent disk:
   - Scroll to "Advanced"
   - Enable "Persistent Disk"
   - Set size (e.g., 1GB)
   - Mount path: `/opt/render/project/src/websites`
7. Click **"Create Web Service"**
8. Wait for deployment
9. Copy your service URL (e.g., `your-app.onrender.com`)

### Step 3: Update Mount Path

Update `server/index.js` to use Render's persistent disk:

```js
// For Render persistent disk
const websitesDir = process.env.RENDER 
  ? path.join('/opt/render/project/src', 'websites')
  : path.join(__dirname, '..', 'websites');
```

## Option 3: Fly.io

Fly.io offers global deployment with persistent volumes.

### Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or download from https://fly.io/docs/hands-on/install-flyctl/
```

### Step 2: Create `fly.toml`

Create `server/fly.toml`:

```toml
app = "your-app-name"
primary_region = "iad"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[mounts]
  source = "websites_data"
  destination = "/app/websites"
```

### Step 3: Deploy

```bash
cd server
fly launch
# Follow prompts
fly secrets set OPENAI_API_KEY=your-key
fly secrets set ANTHROPIC_API_KEY=your-key
fly secrets set GROQ_API_KEY=your-key
fly secrets set GEMINI_API_KEY=your-key
fly deploy
```

## Option 4: Heroku

### Step 1: Create `Procfile`

Create `server/Procfile`:

```
web: node index.js
```

### Step 2: Deploy

```bash
cd server
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your-key
heroku config:set ANTHROPIC_API_KEY=your-key
heroku config:set GROQ_API_KEY=your-key
heroku config:set GEMINI_API_KEY=your-key
git subtree push --prefix server heroku main
```

**Note**: Heroku's filesystem is ephemeral. Consider using external storage for production.

## Environment Variables

Set these in your hosting platform:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Auto-set | Server port (usually auto-set by platform) |
| `OPENAI_API_KEY` | Optional | OpenAI API key |
| `ANTHROPIC_API_KEY` | Optional | Anthropic API key |
| `GROQ_API_KEY` | Optional | Groq API key |
| `GEMINI_API_KEY` | Optional | Google Gemini API key |

## Testing Your Deployment

After deployment, test your backend:

```bash
# Health check
curl https://your-backend-url.railway.app/api/health

# Should return: {"ok":true}

# Check provider availability
curl https://your-backend-url.railway.app/api/sites/availability

# List sites
curl https://your-backend-url.railway.app/api/sites
```

## Updating Frontend Configuration

After deploying your backend, update `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/preview/*"
  to = "https://your-backend-url.railway.app/preview/:splat"
  status = 200
  force = true
```

Or set environment variable in Netlify:
- `VITE_API_URL` = `https://your-backend-url.railway.app`

## Troubleshooting

### CORS Errors
- Ensure `cors()` middleware is enabled
- Add your frontend URL to CORS origins if needed

### File Storage Issues
- Verify persistent storage is enabled
- Check file permissions
- Consider using external storage (S3) for production

### Port Issues
- Don't hardcode port 3000
- Use `process.env.PORT || 3000` (already done)

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in your platform's dashboard

## Recommended Setup

**For Production:**
1. **Backend**: Railway or Render (both support persistent storage)
2. **Frontend**: Netlify (already configured)
3. **Storage**: Consider migrating to S3/Cloud Storage for better reliability

**For Development:**
- Keep using local setup with `npm run dev`

## Next Steps

1. Deploy backend to Railway/Render
2. Test backend endpoints
3. Update `netlify.toml` with backend URL
4. Deploy frontend to Netlify
5. Test full integration
