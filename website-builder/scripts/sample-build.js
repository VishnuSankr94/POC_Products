/**
 * Trigger one sample build via API (for testing).
 * Run from project root: node scripts/sample-build.js
 */
const form = new FormData();
form.append('prompt', 'Build a beautiful website for a pen and stationery shop called Pen World. Include hero, featured pens section with prices in rupees, about us, and contact form.');
form.append('provider', 'groq');

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 180000); // 3 min

fetch('http://localhost:3000/api/build', {
  method: 'POST',
  body: form,
  signal: controller.signal,
})
  .then((r) => {
    clearTimeout(timeout);
    return r.json().then((data) => ({ ok: r.ok, data }));
  })
  .then(({ ok, data }) => {
    if (ok) {
      console.log('Build success:', JSON.stringify(data, null, 2));
      process.exit(0);
    } else {
      console.error('Build failed:', data.error || data);
      process.exit(1);
    }
  })
  .catch((err) => {
    clearTimeout(timeout);
    console.error('Error:', err.message);
    process.exit(1);
  });
