# Netlify Deployment Guide

This guide covers deploying your website builder application to Netlify.

## Overview

Your application consists of:
- **Frontend**: React + Vite app in `client/` folder
- **Backend**: Express API server in `server/` folder

## Option 1: Frontend-Only Deployment (Recommended for Quick Start)

Deploy only the frontend to Netlify and host the backend separately (Railway, Render, etc.).

### Step 1: Deploy Backend Separately

First, deploy your backend to a service that supports Node.js:

**Option A: Railway** (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repo
4. Add a new service → Select `server/` folder
5. Set environment variables in Railway dashboard:
   - `OPENAI_API_KEY` (if using OpenAI)
   - `ANTHROPIC_API_KEY` (if using Anthropic)
   - `GROQ_API_KEY` (if using Groq)
   - `GEMINI_API_KEY` (if using Gemini)
6. Railway will auto-detect Node.js and deploy
7. Note your Railway URL (e.g., `https://your-app.railway.app`)

**Option B: Render**
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Deploy

### Step 2: Update Frontend Configuration

Update `client/vite.config.js` to use your backend URL in production:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/preview': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  // Add this for production builds
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
  },
});
```

Update `client/src/App.jsx` to use environment variable:

```js
const API = import.meta.env.VITE_API_URL || '/api';
```

### Step 3: Configure Netlify Redirects

Update `netlify.toml` with your backend URL:

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

### Step 4: Deploy to Netlify

**Via Netlify Dashboard:**
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/dist`
5. Add environment variables (if needed):
   - `VITE_API_URL` = your backend URL (optional, if using redirects)
6. Click "Deploy site"

**Via Netlify CLI:**
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
cd client
netlify init
netlify deploy --prod
```

**Via Git Push:**
1. Push your code to GitHub
2. Connect the repo in Netlify dashboard
3. Netlify will auto-deploy on every push to main branch

## Option 2: Full-Stack with Netlify Functions (Advanced)

Convert your Express backend to Netlify Functions. This requires refactoring your backend code.

### Step 1: Install Netlify CLI and Dependencies

```bash
npm install -g netlify-cli
npm install --save-dev @netlify/plugin-nextjs
```

### Step 2: Create Netlify Functions

You'll need to convert your Express routes to Netlify Functions:
- `netlify/functions/build.js` - for `/api/build`
- `netlify/functions/sites.js` - for `/api/sites`
- `netlify/functions/preview.js` - for `/preview/:id`

### Step 3: Update Configuration

The `netlify.toml` would need additional function configuration.

**Note**: This approach is more complex and may have limitations with file uploads and storage. Option 1 is recommended.

## Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

- `VITE_API_URL` (optional) - Your backend URL if not using redirects
- Backend environment variables should be set in your backend hosting service (Railway/Render)

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Netlify dashboard

### API Calls Fail
- Verify redirects in `netlify.toml` are correct
- Check CORS settings on your backend
- Ensure backend URL is accessible

### Preview Not Working
- Verify `/preview/*` redirect is configured
- Check that backend serves static files correctly

## Quick Deploy Checklist

- [ ] Backend deployed and accessible
- [ ] Backend URL noted
- [ ] `netlify.toml` configured with backend URL
- [ ] Environment variables set in Netlify
- [ ] Frontend builds successfully locally (`cd client && npm run build`)
- [ ] Site deployed and tested

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
