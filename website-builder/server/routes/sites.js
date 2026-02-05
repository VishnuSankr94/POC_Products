import express from 'express';
import fs from 'fs/promises';
import path from 'path';

export const sitesRouter = express.Router();

function getWebsitesDir(req) {
  return req.app.get('websitesDir');
}

sitesRouter.get('/', async (req, res) => {
  try {
    const dir = getWebsitesDir(req);
    await fs.mkdir(dir, { recursive: true });
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const folders = entries.filter((e) => e.isDirectory());
    const list = [];
    for (const f of folders) {
      const metaPath = path.join(dir, f.name, 'meta.json');
      try {
        const raw = await fs.readFile(metaPath, 'utf-8');
        const meta = JSON.parse(raw);
        list.push({
          id: meta.id || f.name,
          prompt: meta.prompt || '',
          provider: meta.provider || '',
          createdAt: meta.createdAt || '',
        });
      } catch (_) {
        list.push({ id: f.name, prompt: '', provider: '', createdAt: '' });
      }
    }
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    res.json(list);
  } catch (err) {
    console.error('List sites error:', err);
    res.status(500).json({ error: err.message || 'Failed to list sites' });
  }
});

sitesRouter.get('/availability', async (req, res) => {
  try {
    const { getProviderAvailability } = await import('../services/llm.js');
    const availability = await getProviderAvailability();
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to check availability' });
  }
});
