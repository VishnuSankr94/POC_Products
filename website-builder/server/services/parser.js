import path from 'path';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const ALLOWED_EXT = new Set(['.pdf', '.docx', '.doc', '.txt']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * @param {Express.Multer.File} file
 * @returns {Promise<string>}
 */
export async function parseFile(file) {
  if (!file || !file.originalname) return '';
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return '';

  const buf = file.buffer;
  if (buf.length > MAX_FILE_SIZE) return '[File too large, skipped]';

  try {
    if (ext === '.pdf') {
      const data = await pdfParse(buf);
      return data.text || '';
    }
    if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer: buf });
      return result.value || '';
    }
    if (ext === '.txt') {
      return buf.toString('utf-8');
    }
  } catch (err) {
    console.error('Parse error for', file.originalname, err);
    return `[Could not parse ${file.originalname}]`;
  }
  return '';
}

/**
 * @param {Express.Multer.File[]} files
 * @returns {Promise<string>}
 */
export async function parseAllFiles(files) {
  if (!Array.isArray(files) || files.length === 0) return '';
  const texts = await Promise.all(files.map(parseFile));
  return texts.filter(Boolean).join('\n\n---\n\n');
}
