# TinyTales AI — Pre-Demo Manual Checklist

Run this checklist before every demo or deployment.

---

## ⚙️ Environment Setup (Do First)

- [ ] LM Studio is open and local server is running on `http://127.0.0.1:1234`
- [ ] A model is loaded in LM Studio (context length set to **4096**)
- [ ] `~/TinyTales_Project/.env.local` contains correct values:
  ```
  OPENAI_BASE_URL=http://127.0.0.1:1234/v1
  OPENAI_MODEL=local-model
  ```
- [ ] Dev server is running: `npm run dev` from `~/TinyTales_Project`
- [ ] App is accessible at http://localhost:3000

---

## ✅ Pre-Demo · 5 Checks

### 1. 🌐 3 Major Browsers
Test the app loads and works correctly in all three:

| Browser | Loads? | Chat works? | Fonts correct? | Layout OK? |
|---------|--------|-------------|----------------|------------|
| Chrome  | [ ]    | [ ]         | [ ]            | [ ]        |
| Firefox | [ ]    | [ ]         | [ ]            | [ ]        |
| Edge    | [ ]    | [ ]         | [ ]            | [ ]        |

**How to test:** Open http://localhost:3000 in each browser. Send one message (e.g. "What is gravity?") and verify Pip responds.

---

### 2. 📱 Mobile Viewport Check
Verify the notebook UI looks correct on small screens.

- [ ] Open Chrome DevTools → Toggle device toolbar (`Ctrl+Shift+M`)
- [ ] Set viewport to **iPhone SE** (375×667)
- [ ] Spiral rings are hidden on mobile (expected behaviour)
- [ ] Input bar and Ask Pip button are fully visible
- [ ] Sticky notes and story cards do not overflow the screen
- [ ] Set viewport to **iPad** (768×1024) — layout looks balanced

---

### 3. 🐢 Slow Network (3G) Simulation
Verify the app degrades gracefully on a slow connection.

- [ ] Open Chrome DevTools → Network tab → Throttle to **Slow 3G**
- [ ] Reload the page — it should still load (fonts may take longer)
- [ ] Send a message — the **typing indicator (3 animated dots)** should appear while waiting
- [ ] Pip eventually responds without crashing or showing a blank screen
- [ ] Disable throttle when done

---

### 4. 🤖 Live API Responses
Verify real end-to-end AI responses are working.

- [ ] Ask: **"What are black holes?"** → Pip replies with a story opening ("Once upon a time…", "Imagine if…", or "You know how…")
- [ ] Ask: **"Why is the sky blue?"** → Pip gives a different, unique story
- [ ] Click a **Quick-Ask pill** → The input fills correctly, submitting works
- [ ] Check that Pip closes with: *"And THAT is what [topic] is! Pretty cool, right? ✨"*
- [ ] Check response uses **max 2 emojis** per message
- [ ] Verify the **error banner** appears if LM Studio is stopped mid-session (stop the server in LM Studio, then send a message)

---

### 5. 🎨 Visual Design Check
Verify the UI matches the PRD design spec.

- [ ] Header: 📖 logo, "TinyTales AI" in Lora serif font, tagline in Patrick Hand
- [ ] "Pip is ready ✨" pill visible in header (dashed sage border)
- [ ] Notebook: spiral rings visible on desktop, parchment background colour
- [ ] Lined page: blue horizontal rules + red margin line visible
- [ ] Pip messages: white card with sage left border + page-curl corner
- [ ] User messages: yellow sticky note with slight rotation + tape strip on top
- [ ] Typing indicator: 3 animated dots in sage colour
- [ ] Footer: pencil emoji ✏️ visible in input box
- [ ] Quick-ask pills: dashed border, hover transitions to sage colour

---

## 🚨 Known Issues & Fallbacks

| Scenario | Expected Behaviour |
|----------|--------------------|
| LM Studio server not running | Error banner appears, Pip shows butterfly message |
| Context window exceeded (too many messages) | Same error banner — refresh page to reset |
| GPU/VRAM out of memory | LM Studio crashes — reload model with smaller context (2048) |
| Port 3000 in use | Next.js auto-uses port 3001 — check terminal output |

---

*Last updated: 2026-07-07*
