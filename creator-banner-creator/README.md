# Creator Banner Creator

Create banner carousels from uploaded images or AI-generated images (Google Gemini 2.5 Flash Image). Use a region-based calendar to generate celebration banners and download a ZIP to publish on any website.

## Features

- **Banner carousel**: Multiple slides with aspect ratio options (16:9, 3:1, 4:1, 1:1), autoplay, product name/link and captions.
- **Image sources**: Upload images (resized/cropped to aspect ratio) or generate with AI from a text prompt (Gemini 2.5 Flash Image).
- **Region-based calendar**: Pick a region (India, US), select a date, see celebrations and create a banner for that celebration with your product.
- **Download**: Export a ZIP with `index.html`, `images/`, and `banner-config.json` to use on any site or with the [creator-banner-carousel](packages/banner-carousel) npm package.

## Setup

1. Clone or download this repo.
2. Install dependencies: `npm install`
3. Add your Google Gemini API key:
   - Copy `.env.local.example` to `.env.local`
   - Set `GOOGLE_GEMINI_API_KEY` (get a key from [Google AI Studio](https://aistudio.google.com/apikey))
4. Run the app: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Run ESLint

## NPM package (embed on your site)

The [packages/banner-carousel](packages/banner-carousel) package lets you render exported banners in any React app. See [packages/banner-carousel/README.md](packages/banner-carousel/README.md) for install and usage.

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Google Gemini API (gemini-2.5-flash-image) for image generation
- JSZip for export ZIP
- Static JSON for region celebrations (India, US)
