# TinyTales AI — Learning Journey

> A personal retrospective of building, debugging, and deploying a Next.js AI chatbot from scratch.

---

## Overview

This document captures the full learning process behind the TinyTales AI project — from running the first development server to connecting a local AI model. It's written honestly, including every obstacle hit along the way and what was learned from each one.

**Project:** TinyTales AI — an AI storyteller that explains complex topics to a 5-year-old  
**Stack:** Next.js 14, React 18, DeepSeek API / LM Studio  
**Environment:** Windows 11 + WSL (Ubuntu)

---

## Phase 1 — Getting the Project Running

### What Was Done
Took an existing Next.js project from a zip file in the Downloads folder and tried to run it for the first time using WSL.

### Obstacle: Double-Nested Folder Structure
The unzipped project had a confusing `tinytales-next/tinytales-next/` double-nested folder. Running `npm install` or `npm run dev` from the wrong level would fail silently or throw a missing `package.json` error.

**Solution:** Always navigate into the folder that contains `package.json` before running any npm commands. Use `ls` or `dir` to verify you're in the right place.

**Lesson learned:**
> When unzipping a project, always check the folder structure first. Many zip files wrap the project in an extra folder. The correct working directory is always the one that contains `package.json`.

---

### Obstacle: Missing `.env.local` File
The app started but the AI wouldn't respond. The server returned a `500` error.

**Root cause:** The project required a `.env.local` file with the API key, but this file is gitignored by design — it's never included in the zip or repo.

**Solution:** There was an `.env.local.example` file included as a template. Copying it and filling in the real key fixed the issue.

```bash
cp .env.local.example .env.local
# then edit .env.local and add your key
```

**Lesson learned:**
> Always check for `.env.local.example` or `.env.example` files in a new project. These are the developer's way of documenting what environment variables are required without committing real secrets.

---

## Phase 2 — Connecting LM Studio (Local AI)

### What Was Done
Wanted to run the AI completely offline using a local model in LM Studio instead of the cloud DeepSeek API.

### Obstacle: API Key Required Even for Local Models
The original code checked for `DEEPSEEK_API_KEY` and returned a `500` error if it wasn't set — even when using a local model that doesn't need a real key.

**Solution:** Updated `app/api/chat/route.js` to fall back gracefully. If no real key is set, it uses the string `"lm-studio"` as a dummy bearer token (LM Studio accepts any value):

```js
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "lm-studio";
const endpoint = process.env.OPENAI_BASE_URL || "https://api.deepseek.com/v1";
const modelName = process.env.OPENAI_MODEL || "deepseek-chat";
```

**Lesson learned:**
> Design API routes to be provider-agnostic from the start. Hardcoding a specific provider's endpoint makes it painful to switch later. Environment variables are the right abstraction layer.

---

### Obstacle: WSL Cannot Reach Windows localhost
LM Studio runs on Windows. The Next.js server runs inside WSL (Linux). When the app tried to connect to `http://127.0.0.1:1234`, the connection was immediately refused.

**Root cause:** Inside WSL, `127.0.0.1` is the Linux loopback address — it points to the WSL virtual machine itself, not the Windows host. LM Studio is running on the Windows side, so it's unreachable at that address.

**Attempted solutions:**
1. Used the WSL gateway IP (`172.17.32.1`) — connection hung (Windows Firewall blocked it)
2. Used the LAN IP (`192.168.110.222`) — same result

**Root cause (deeper):** Windows Firewall was blocking inbound connections from WSL's virtual network adapter to LM Studio's port.

**Final solution:** Move the Next.js app to run natively on Windows instead of inside WSL. Both LM Studio and Node.js then share the same `localhost`, completely bypassing the WSL network boundary.

**Lesson learned:**
> WSL and Windows do NOT share localhost. Any Windows service (like LM Studio) is unreachable at `127.0.0.1` from inside WSL. The safest fix is to run all services on the same side of the boundary — either all on Windows, or all in Docker. Mixing WSL and Windows services creates complex networking problems.

---

### Obstacle: Windows Firewall Blocking Node.js
Even after moving to native Windows, `curl` tests timed out — suggesting Windows Firewall was blocking outbound requests from the Node.js process.

**Solution:** Found `node.exe` in Windows Firewall → "Allow an app through firewall" settings and ensured both **Private** and **Public** network checkboxes were ticked.

**Lesson learned:**
> When Windows blocks a process from making network requests, it often shows no error — the connection just times out silently. If a connection works in the browser but not in Node.js, check Windows Firewall first. `node.exe` is the entry to look for.

---

## Phase 3 — Moving the Project to WSL

### What Was Done
Moved the entire project from `C:\Users\Daniel\Downloads\` into the native WSL filesystem (`~/TinyTales_Project`) for better performance.

### Obstacle: Broken `node_modules` After Moving
After copying the project from Windows to WSL, running `npm install` failed with:

```
EACCES: permission denied, rename 'node_modules/next' -> 'node_modules/.next-YVYJ7uu1'
```

**Root cause:** Windows and Linux handle file permissions differently. When `node_modules` was copied from a Windows NTFS filesystem into the Linux ext4 filesystem, the file permission metadata was stripped or corrupted. npm couldn't rename files inside the broken `node_modules`.

**Solution:** Delete the copied `node_modules` entirely and run `npm install` fresh inside the Linux filesystem:

```bash
rm -rf node_modules
npm install
```

**Lesson learned:**
> Never copy `node_modules` between Windows and WSL filesystems. The symlinks and permissions inside `node_modules` are fragile and NTFS/ext4 are incompatible in subtle ways. Always use `rsync --exclude 'node_modules'` when moving projects, then run `npm install` fresh on the destination side.

---

## Phase 4 — Port Conflicts

### Obstacle: `Port 3000 is in use, trying 3001 instead`
After moving the project, the new server started on port 3001 instead of 3000. The old server on 3000 showed an "Internal Server Error" because its project files were gone.

**Root cause:** The original dev server process was never stopped before moving the project. Even after the project files were deleted, the Node.js process kept running in the background, holding port 3000 open.

**Solution:** Always press `Ctrl+C` in the terminal to gracefully stop the dev server before moving or deleting a project. If already stuck, find and kill the process:

```bash
# Linux/WSL
npx kill-port 3000

# Or find the process manually
lsof -i :3000
kill -9 <PID>
```

**Lesson learned:**
> A Next.js dev server process keeps running even if you close its terminal window or delete the project folder. It will silently hold its port until killed. Get into the habit of always stopping the server cleanly with `Ctrl+C` before moving anything.

---

## Phase 5 — React Hydration Error

### Obstacle: "Text content did not match. Server: `*, *::before...`"
After the project was running on the new setup, this error appeared in the browser console and the page showed a white flash on load.

**Root cause:** Next.js renders the page on the server first (SSR), then re-renders it on the client (hydration). When the `<style>` tag was written as `<style>{STYLES}</style>`, React's string diffing algorithm found tiny whitespace differences between the server and client renders and threw a mismatch error.

**Solution:** Use `dangerouslySetInnerHTML` for inline style tags in Next.js. This tells React to inject the string directly without diffing it:

```jsx
// Before (causes hydration error):
<style>{STYLES}</style>

// After (correct for Next.js):
<style dangerouslySetInnerHTML={{ __html: STYLES }} />
```

**Lesson learned:**
> In Next.js (and any SSR framework), injecting raw strings into `<style>` or `<script>` tags requires `dangerouslySetInnerHTML`. React's hydration is very strict about content matching exactly between server and client renders. The `dangerouslySetInnerHTML` prop bypasses diffing and inserts the string verbatim.

---

## Phase 6 — PowerShell Execution Policy

### Obstacle: `npm` command fails on Windows PowerShell
Running `npm install` in PowerShell threw:

```
File npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Root cause:** Windows PowerShell has a security feature called "Execution Policy" that blocks unsigned PowerShell scripts by default. npm on Windows is invoked through a `.ps1` PowerShell script, which gets blocked.

**Solution:** Use `cmd` (Command Prompt) instead of PowerShell for npm commands:

```cmd
cmd /c "npm install"
cmd /c "npm run dev"
```

Or permanently fix it for your user in PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Lesson learned:**
> Windows PowerShell and Command Prompt (`cmd`) have different security models. When npm scripts are blocked in PowerShell, `cmd /c` is a quick workaround. The long-term fix is setting the execution policy to `RemoteSigned` for your user — this allows locally written scripts to run while still blocking unsigned scripts from the internet.

---

## Phase 7 — GitHub Preparation

### What Was Done
Prepared the project for a public GitHub push — security audit, README rewrite, screenshot integration.

### Lesson: Never Commit `.env.local`
The `.gitignore` already excluded `.env.local`, but it's worth understanding why this is critical:

- If `.env.local` is pushed, anyone who clones the repo has your API key
- Once a secret is in git history, it's there forever — even if you delete the file later
- The correct pattern: commit `.env.local.example` (safe placeholders), gitignore `.env.local` (real secrets)

**Lesson learned:**
> Audit your `.gitignore` before every first push to a new repo. Run `git status` and make sure no `.env` files appear in the list. If a secret is ever accidentally committed, rotate (regenerate) the key immediately — assume it's compromised.

---

### Lesson: `dangerouslySetInnerHTML` is Not Actually Dangerous Here
The name sounds scary, but in this context it's the correct and safe approach. "Dangerous" refers to XSS (cross-site scripting) attacks — injecting user-provided content into the DOM. Since `STYLES` is a hardcoded constant defined in the source code (not user input), there is no XSS risk.

**Lesson learned:**
> React uses the word "dangerously" to make developers pause and think. It's only actually dangerous when the injected content comes from an untrusted source (e.g., user input or a database). Static strings defined in your source code are safe.

---

## Summary of Key Lessons

| # | Lesson | Context |
|---|--------|---------|
| 1 | Always check which folder contains `package.json` before running npm commands | Project setup |
| 2 | `.env.local.example` tells you what secrets are required | Environment setup |
| 3 | Design API routes to be provider-agnostic using environment variables | Architecture |
| 4 | WSL and Windows do NOT share `localhost` — avoid mixing them | Networking |
| 5 | Never copy `node_modules` across filesystems — delete and reinstall fresh | File systems |
| 6 | Always stop the dev server (`Ctrl+C`) before moving or deleting a project | Process management |
| 7 | Use `dangerouslySetInnerHTML` for inline `<style>` tags in Next.js SSR | React / Next.js |
| 8 | Use `cmd /c` if npm is blocked by PowerShell's execution policy | Windows tooling |
| 9 | Audit `.gitignore` and run `git status` before every first push | Security |
| 10 | Windows Firewall blocks network requests silently — check `node.exe` permissions | Windows networking |

---

## What I Would Do Differently Next Time

1. **Start in WSL or Docker from day one** — never develop a Node.js project in the Windows filesystem. Pick one side and stay on it.
2. **Set up `.env.local` immediately** when cloning a new project — before even running `npm install`.
3. **Use Docker Compose** for projects that mix local AI tools (LM Studio, Ollama) with a web server — Docker's `host.docker.internal` handles cross-service networking cleanly without any firewall issues.
4. **Read the README first** — the project's README already had the correct setup steps. Following them precisely would have avoided several early obstacles.

---

*Written: 2026-07-08 | Environment: Windows 11 + WSL Ubuntu + LM Studio*
