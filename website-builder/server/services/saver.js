import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

/**
 * Parse LLM response into { html, css, js }. Expects markdown code blocks.
 * @param {string} text
 * @returns {{ html: string, css: string, js: string }}
 */
export function parseCodeBlocks(text) {
  const htmlMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const cssMatch = text.match(/```(?:css)?\s*([\s\S]*?)```/i);
  const jsMatch = text.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);

  const html = htmlMatch ? htmlMatch[1].trim() : '';
  const css = cssMatch ? cssMatch[1].trim() : '';
  const js = jsMatch ? jsMatch[1].trim() : '';

  return { html, css, js };
}

/**
 * Create a full index.html that links to external CSS and JS.
 */
export function buildIndexHtml(html, css, js) {
  const hasBody = /<body[\s>]/.test(html);
  const hasHtml = /<!DOCTYPE|<\/?html/i.test(html);

  let content = html;
  if (!hasHtml) {
    content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Site</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${content}
<script src="script.js"></script>
</body>
</html>`;
  } else {
    if (!content.includes('styles.css')) {
      content = content.replace('</head>', '  <link rel="stylesheet" href="styles.css">\n</head>');
    }
    if (!content.includes('script.js')) {
      content = content.replace('</body>', '  <script src="script.js"></script>\n</body>');
    }
  }

  return content;
}

/**
 * @param {string} websitesDir
 * @param {{ html: string, css: string, js: string }} blocks
 * @param {{ prompt: string, provider: string }} meta
 * @returns {Promise<{ id: string, path: string, previewUrl: string }>}
 */
export async function saveBuild(websitesDir, blocks, meta) {
  await fs.mkdir(websitesDir, { recursive: true });

  const shortId = randomBytes(4).toString('hex');
  const timestamp = Date.now();
  const id = `build_${timestamp}_${shortId}`;
  const dir = path.join(websitesDir, id);
  await fs.mkdir(dir, { recursive: true });

  const indexHtml = buildIndexHtml(blocks.html, blocks.css, blocks.js);
  await fs.writeFile(path.join(dir, 'index.html'), indexHtml, 'utf-8');
  await fs.writeFile(path.join(dir, 'styles.css'), blocks.css || '/* no styles */', 'utf-8');
  await fs.writeFile(path.join(dir, 'script.js'), blocks.js || '// no script', 'utf-8');
  await fs.writeFile(
    path.join(dir, 'meta.json'),
    JSON.stringify({ id, ...meta, createdAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );

  return {
    id,
    path: dir,
    previewUrl: `/preview/${id}/index.html`,
  };
}
