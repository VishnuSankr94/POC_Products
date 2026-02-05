# Deploying CBMN (Call By Name)

Since this application uses **Socket.io** (a persistent connection), you cannot deploy everything to Netlify. Netlify is for static sites and short-lived serverless functions.

**Strategy:**
1. **Server**: Deploy to **Render.com** (Free, supports Node.js/Socket.io).
2. **Client**: Deploy to **Netlify** (Free, excellent for React apps).

---

## Part 1: Deploy Server to Render

1. **Push your code to GitHub**.
   - Create a repo and push the entire `CBMN` folder.
   
2. **Create Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) -> New -> Web Service.
   - Connect your GitHub repo.
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - Click **Deploy**.
   
3. **Get Server URL**:
   - Once deployed, copy the URL (e.g., `https://cbmn-server.onrender.com`).

---

## Part 2: Deploy Client to Netlify

1. **Go to Netlify**:
   - [app.netlify.com](https://app.netlify.com) -> Add new site -> Import from existing project.
   - Connect GitHub repo.

2. **Configure Build**:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Set Environment Variable** (Crucial):
   - Click **"Show advanced"** (or go to Site Settings > Environment variables later).
   - Key: `VITE_SERVER_URL`
   - Value: `https://your-render-url.onrender.com` (The URL from Part 1).

4. **Deploy**.

---

## Why not just Netlify?
Netlify "Serverless Functions" generally time out after 10-26 seconds and kill connections. Socket.io requires a server that stays alive to keep the user connected. Render/Railway/Heroku provide this.
