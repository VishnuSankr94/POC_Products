import dotenv from 'dotenv';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildRouter } from './routes/build.js';
import { sitesRouter } from './routes/sites.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env – try project root (parent of server/), then cwd, then cwd parent
const envPaths = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    break;
  }
}
// Fallback: load .env from cwd (e.g. if started from project root)
if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
  dotenv.config({ override: true });
}

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// Use Render's persistent disk if available, otherwise use relative path
const websitesDir = process.env.RENDER 
  ? path.join('/opt/render/project/src', 'websites')
  : path.join(__dirname, '..', 'websites');
app.set('websitesDir', websitesDir);

app.use('/api/build', buildRouter);
app.use('/api/sites', sitesRouter);

// Serve generated sites for preview
app.use('/preview/:id', (req, res, next) => {
  const id = req.params.id;
  const sitePath = path.join(websitesDir, id);
  express.static(sitePath)(req, res, next);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  const keys = {
    OPENAI_API_KEY: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()),
    ANTHROPIC_API_KEY: !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()),
    GROQ_API_KEY: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()),
    GEMINI_API_KEY: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()),
  };
  console.log('API keys loaded:', Object.entries(keys).map(([k, v]) => `${k.replace('_API_KEY', '')}: ${v ? 'yes' : 'no'}`).join(', '));
});
