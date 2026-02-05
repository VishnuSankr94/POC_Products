# Local Website Builder

A local web app that generates websites from a text prompt and optional requirement documents, using **Ollama** (local) or **Cloud** (OpenAI / Anthropic). Each build is saved as a separate project folder.

## Prerequisites

- **Node.js** (v18+)
- **Ollama** (optional, for local LLM): [ollama.ai](https://ollama.ai). Install and run `ollama pull llama3` (or another model).
- **Cloud API keys** (optional): Set `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY` in `.env` for cloud providers.

## Quick start

1. **Install dependencies** (root + client + server):
   ```bash
   npm run install:all
   ```

2. **Copy environment** (optional, for cloud):
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and add your API keys if using OpenAI or Anthropic.

3. **Run the app**:
   ```bash
   npm run dev
   ```
   This starts the backend (port 3000), the frontend (port 5173), and opens the app in your browser.

4. **Use the app**: Type a prompt, optionally upload PDF/DOCX/TXT requirements, choose Ollama or a cloud provider, then click **Build**. Generated sites are saved under `websites/` and listed in the app; you can preview or open them.

## Project structure

- `client/` – React + Vite frontend
- `server/` – Express backend (API, LLM, file storage)
- `websites/` – Generated site folders (one per build)
- `scripts/dev.js` – Starts both servers and opens the browser

## Running client or server only

- `npm run client` – Frontend only (Vite, port 5173)
- `npm run server` – Backend only (Express, port 3000)

Make sure the other is running when testing full flow.
