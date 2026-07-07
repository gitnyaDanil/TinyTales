# TinyTales AI 📖

> Big ideas explained in tiny words — a children's AI storyteller powered by your choice of AI.

Ask Pip anything. She'll explain it like you're five, using stories about cookies, puppies, and lego bricks.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![LM Studio](https://img.shields.io/badge/LM%20Studio-compatible-purple)
![DeepSeek](https://img.shields.io/badge/DeepSeek-compatible-green)

---

## Screenshots

| "How does the internet work?" | "What is machine learning?" | "What is money printing?" |
|:---:|:---:|:---:|
| ![How does the internet work](docs/screenshots/How%20does%20the%20internet%20work.png) | ![What is machine learning](docs/screenshots/What%20is%20machine%20learning.png) | ![What is money printing](docs/screenshots/What%20is%20money%20printing.png) |



## Features

- 🧸 **Pip persona** — warm, imaginative AI storyteller with a consistent voice
- 📓 **Notebook UI** — hand-crafted CSS notebook with spiral rings, lined pages, sticky notes, and page-curl cards
- ⚡ **Provider-agnostic** — swap between LM Studio (local), DeepSeek, or OpenAI via a single env variable
- 🔒 **Secure by design** — API key lives server-side only, never exposed to the browser
- 💊 **Quick-ask pills** — one-click starter questions
- 💬 **Typing indicator** — animated dots while Pip thinks

---

## Running Locally

### 1. Clone & install
```bash
git clone https://github.com/gitnyaDanil/TinyTales.git
cd TinyTales
npm install
```

### 2. Configure your AI provider

Copy the example env file:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and choose one of the options below.

---

#### Option A — LM Studio (fully local, free, no internet required)
1. Download [LM Studio](https://lmstudio.ai) and load any model (e.g. Llama 3, Phi-3, Mistral)
2. Go to the **Local Server** tab → enable **"Serve on Local Network"** → Start Server
3. Note the URL shown (e.g. `http://192.168.x.x:1234`)

```env
OPENAI_BASE_URL=http://192.168.x.x:1234/v1
OPENAI_MODEL=local-model
DEEPSEEK_API_KEY=lm-studio
```

> **Recommended context length:** 2048–4096 tokens in LM Studio for optimal performance.

#### Option B — DeepSeek (cloud, ~$0.003/conversation)
Get your key at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

#### Option C — OpenAI
```env
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
DEEPSEEK_API_KEY=your_openai_key_here
```

---

### 3. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel (free tier)

```bash
git init
git add .
git commit -m "initial commit"
gh repo create tinytales-ai --public --push
```

Then import at [vercel.com/new](https://vercel.com/new) and add your environment variables under **Settings → Environment Variables**.

---

## Project Structure

```
tinytales-ai/
├── app/
│   ├── page.jsx          # Chat UI (React, "use client")
│   ├── layout.jsx        # Root HTML shell & metadata
│   └── api/chat/
│       └── route.js      # Server-side AI proxy (holds API key)
├── docs/
│   ├── TinyTales_AI_PRD.docx
│   └── pre-demo-checklist.md
├── .env.local.example    # Safe template — committed to git
├── .env.local            # Your secrets — gitignored, never committed
└── next.config.mjs
```

---

## API Security

- The API key is stored in `.env.local` — **gitignored and never committed**
- In production it lives in Vercel's encrypted environment variable store
- The browser **never** sees the key — all AI calls go through `/api/chat` on the server

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (functional components + hooks) |
| Framework | Next.js 14 (App Router) |
| AI | DeepSeek / LM Studio / OpenAI (provider-agnostic) |
| Styling | CSS-in-JS (inline style tag) |
| Fonts | Google Fonts (Lora, Nunito, Patrick Hand) |
| Hosting | Vercel (free tier) |
