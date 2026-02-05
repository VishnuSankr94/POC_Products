import express from 'express';
import multer from 'multer';
import { parseAllFiles } from '../services/parser.js';
import { generate } from '../services/llm.js';
import { parseCodeBlocks, saveBuild } from '../services/saver.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const buildRouter = express.Router();

buildRouter.post('/', upload.array('requirements', 5), async (req, res) => {
  try {
    const prompt = typeof req.body.prompt === 'string' ? req.body.prompt.trim() : '';
    const provider = (req.body.provider || 'ollama').toLowerCase();
    if (!['ollama', 'openai', 'anthropic', 'groq', 'gemini'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const requirementsText = await parseAllFiles(req.files || []);
    const userContent = requirementsText
      ? `${prompt}\n\nRequirements from documents:\n${requirementsText}`
      : prompt;

    const raw = await generate(provider, userContent);
    const blocks = parseCodeBlocks(raw);
    if (!blocks.html && !blocks.css && !blocks.js) {
      return res.status(502).json({
        error: 'LLM did not return valid HTML/CSS/JS blocks. Try again or another model.',
      });
    }

    const websitesDir = req.app.get('websitesDir');
    const result = await saveBuild(websitesDir, blocks, { prompt, provider });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      id: result.id,
      path: result.path,
      previewUrl: `${baseUrl}${result.previewUrl}`,
    });
  } catch (err) {
    console.error('Build error:', err);
    res.status(500).json({ error: err.message || 'Build failed' });
  }
});
