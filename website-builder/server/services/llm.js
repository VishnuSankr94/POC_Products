const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

const SYSTEM_PROMPT = `You are a professional website designer. Generate a beautiful, modern single-page website that looks like a real business or temple site—NOT a plain or ugly page.

REFERENCE STYLE (match this look):
- Header & footer: dark blue bar, white text, logo (icon + name) on left, nav links on right. Clean, professional.
- Hero: medium blue background, centered white headline and tagline, one prominent green (or accent) CTA button.
- Sections: alternate white and light gray backgrounds. Section titles centered, dark gray text.
- Service/product cards: four-column grid (or responsive equivalent), white or light blue cards with subtle shadow. Each card: icon (green or blue) at top, bold title, short description. Product cards include price in ₹.
- About: two-column layout – left: 2 short paragraphs; right: 3 feature bullets with icons (e.g. "Licensed & Certified", "20+ Years Experience", "10,000+ Happy Customers").
- Contact: two columns – left: form (Full Name, Email, Phone, Message) with green "Send Message" button; right: contact details with icons (address, phone, email, hours).
- Typography: modern sans-serif (e.g. Inter, Open Sans), clear hierarchy. Icons: Font Awesome, green for accents and CTAs, blue for products. Ample spacing; cards and sections feel uncluttered.

DESIGN RULES (MANDATORY – the site must look good):
1. COLOR: Define a proper color scheme. Use CSS variables at the top of your CSS, e.g. --primary, --primary-dark, --accent, --bg-light, --text-dark, --text-muted. Pick a cohesive palette (e.g. deep blue + gold, teal + white, or maroon + cream for temples). Never use only default black text on plain white.
2. TYPOGRAPHY: Load a Google Font (e.g. "Inter", "Poppins", "Playfair Display", "Open Sans") in the HTML <head> and use it for body and headings. Set font-size, line-height (1.5–1.7 for body), and clear heading sizes (h1 much larger than h2, h2 larger than h3).
3. SPACING: Use generous padding and margin. Section padding: at least 4rem 2rem (or 60px 30px). .container: max-width 1200px, margin 0 auto, padding 0 1.5rem. Space between cards and elements so the page breathes.
4. HERO: Full-width or full-viewport feel. Give it a distinct background: linear gradient or solid color (using --primary or similar). Center text. Large headline (2rem–2.5rem or more), readable subtitle. Buttons: padding 12px 24px, border-radius 6–8px, clear background and hover effect (e.g. opacity or darker shade).
5. CARDS: Every card must have: padding (1.5rem), border-radius (8–12px), box-shadow (e.g. 0 4px 14px rgba(0,0,0,0.08)) or a light border, and a hover effect (slight shadow increase or transform). Use a grid (e.g. grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))) for card sections.
6. HEADER/NAV: Sticky or fixed. Background (white or semi-transparent). Logo and links clearly spaced. Nav links: padding, hover underline or color change. Optional: subtle border-bottom or shadow.
7. SECTIONS: Alternate section backgrounds where possible (e.g. white, then --bg-light, then white) so sections are visually separated. Each section has a clear .section-title (centered or left, good font-size and margin-bottom).
8. BUTTONS & INPUTS: Buttons: cursor pointer, border-radius, padding, transition. Inputs and textarea: border (1px solid #ddd or similar), border-radius, padding 10px 14px, focus state (outline or border-color change).
9. FOOTER: Darker or distinct background (e.g. --primary-dark or #1a1a1a), light text. Padding, optional links in a row. Copyright clearly visible.

STRUCTURE:
- HEADER: nav with logo (Font Awesome icon + text), menu links (href="#home", "#services", "#about", "#contact" etc.).
- HERO (id="home"): headline, subtitle, 1–2 CTA buttons.
- CONTENT SECTIONS (ids: services, about, products, contact, etc.): section title + description; content in cards (icon, title, description; prices in ₹ where relevant).
- CONTACT: form (name, email, phone, message) + contact details (address, phone, email, hours) with icons.
- FOOTER: copyright, optional quick links, optional social icons (Font Awesome).
- Optional: back-to-top button (fixed bottom-right, smooth scroll).

TECHNICAL:
- HTML: <!DOCTYPE html>, lang="en", meta charset and viewport. Link styles.css and Font Awesome CDN (https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css). Add one Google Font link. No inline style or script; end body with <script src="script.js"></script>.
- HTML ONLY – NO MARKDOWN: Output only valid HTML. Never use markdown syntax inside HTML: no [text](url), no [placeholder]. For email use <a href="mailto:info@site.com">info@site.com</a>. For forms use <label for="id">Label</label> and <input id="id" name="name">. Use real HTML or plain text only; no [Your Name] or similar placeholders in the final HTML.
- CSS: Start with * { box-sizing: border-box; } and body { margin: 0; font-family: ... }. Use your color variables everywhere. Full styles for header, hero, sections, .container, cards, buttons, form, footer. Mobile-friendly: use media queries so nav and grid stack on small screens.
- JS: Smooth scroll for anchor links; back-to-top show/hide and click; optional mobile menu toggle; form submit preventDefault and alert or console.log.

OUTPUT FORMAT:
Respond with exactly three fenced code blocks, in order:
1. \`\`\`html ... \`\`\`
2. \`\`\`css ... \`\`\`
3. \`\`\`javascript ... \`\`\`
No other text or markdown outside the blocks.`;

/**
 * @param {string} userContent
 * @returns {string}
 */
function buildUserPrompt(userContent) {
  return userContent.trim() || 'Create a simple landing page with a heading and a short paragraph.';
}

/**
 * @param {'ollama'|'openai'|'anthropic'|'groq'|'gemini'} provider
 * @param {string} userContent
 * @returns {Promise<string>}
 */
export async function generate(provider, userContent) {
  const prompt = buildUserPrompt(userContent);

  if (provider === 'ollama') {
    return generateOllama(prompt);
  }
  if (provider === 'openai') {
    return generateOpenAI(prompt);
  }
  if (provider === 'anthropic') {
    return generateAnthropic(prompt);
  }
  if (provider === 'groq') {
    return generateGroq(prompt);
  }
  if (provider === 'gemini') {
    return generateGemini(prompt);
  }
  throw new Error(`Unknown provider: ${provider}`);
}

async function generateOllama(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: `${SYSTEM_PROMPT}\n\nUser request:\n${prompt}`,
      stream: false,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Ollama error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.response || '';
}

async function generateOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });
  const msg = completion.choices?.[0]?.message?.content;
  if (!msg) throw new Error('OpenAI returned no content');
  return msg;
}

async function generateAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic({ apiKey });
  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = message.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('Anthropic returned no text');
  return block.text;
}

async function generateGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  const completion = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });
  const msg = completion.choices?.[0]?.message?.content;
  if (!msg) throw new Error('GROQ returned no content');
  return msg;
}

async function generateGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const resp = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    contents: prompt,
  });
  const text = resp.text ?? resp.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Gemini returned no content');
  return text;
}

/**
 * Check which providers are available (Ollama reachable, env keys set).
 * @returns {Promise<{ ollama: boolean, openai: boolean, anthropic: boolean, groq: boolean, gemini: boolean }>}
 */
export async function getProviderAvailability() {
  const out = { ollama: false, openai: false, anthropic: false, groq: false, gemini: false };
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
    out.ollama = r.ok;
  } catch (_) {}
  out.openai = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  out.anthropic = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());
  out.groq = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
  out.gemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  return out;
}
