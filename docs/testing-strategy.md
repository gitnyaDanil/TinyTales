# TinyTales AI — Testing Strategy

This document outlines the testing approach for TinyTales AI across four layers,
from the smallest unit of logic to the full end-to-end user experience.

> **Status:** Manual pre-demo checklist is implemented. Automated tests are planned for v1.1.

---

## Testing Layers Overview

```
┌─────────────────────────────────────────────┐
│         E2E Tests (Playwright)              │  ← Slowest, most realistic
│   Full browser · real user flows           │
├─────────────────────────────────────────────┤
│      Integration Tests (Supertest)          │  ← API + server together
│   POST /api/chat · real HTTP requests      │
├─────────────────────────────────────────────┤
│    Component Tests (React Testing Library)  │  ← UI in isolation
│   Rendering · interactions · state         │
├─────────────────────────────────────────────┤
│         Unit Tests (Jest)                   │  ← Fastest, most isolated
│   Pure logic · validation · env vars       │
└─────────────────────────────────────────────┘
```

---

## Layer 1 — Unit Tests

**Tool:** Jest  
**Target:** `app/api/chat/route.js`  
**Run command:** `npm test`

Unit tests check the smallest pieces of logic in complete isolation. No real AI, no real HTTP — just pure function behavior.

### Test Cases

| ID | Test | Expected Result |
|----|------|-----------------|
| U-01 | POST with empty `messages` array | Returns `400` with `"messages array is required."` |
| U-02 | POST with missing `messages` field | Returns `400` with `"Invalid JSON body."` |
| U-03 | `OPENAI_BASE_URL` env var is set | Route uses custom endpoint instead of DeepSeek default |
| U-04 | `OPENAI_MODEL` env var is set | Route uses custom model name in request body |
| U-05 | No API key set in env | Falls back to dummy `"lm-studio"` bearer token |
| U-06 | Upstream AI returns `500` | Route propagates the error with correct status code |
| U-07 | Upstream AI returns malformed JSON | Route returns graceful fallback, does not crash |

### Why These Tests Matter
The API route is the security boundary of the app. It holds the API key, validates input, and controls what reaches the AI provider. Unit tests here catch regressions before they hit users.

---

## Layer 2 — Component Tests

**Tool:** React Testing Library + Jest  
**Target:** `app/page.jsx`  
**Run command:** `npm test`

Component tests render the chat UI in a virtual browser (JSDOM) without a real server or AI. They verify that the interface behaves correctly in response to user actions and state changes.

### Test Cases

| ID | Test | Expected Result |
|----|------|-----------------|
| C-01 | Initial render | "Pip is ready ✨" appears in the header |
| C-02 | Initial render | Pip's welcome message appears as a story card |
| C-03 | Initial render | "Ask Pip →" button is disabled when input is empty |
| C-04 | User types in input | "Ask Pip →" button becomes enabled |
| C-05 | User clicks a Quick-Ask pill | Input field is populated with the pill text |
| C-06 | User submits a message | Sticky note (user bubble) appears in the chat |
| C-07 | While waiting for response | Typing indicator (3 animated dots) is visible |
| C-08 | After response arrives | Story card (Pip reply) appears in the chat |
| C-09 | API returns an error | Error banner appears at the bottom of the screen |
| C-10 | Mobile viewport (375px) | Spiral rings are hidden, layout is not broken |

### Why These Tests Matter
The UI is the product. Component tests act as a safety net when refactoring CSS or React logic — if a style or state change accidentally breaks the layout, these tests catch it immediately without needing to open a browser.

---

## Layer 3 — Integration Tests

**Tool:** Supertest + Jest (or Playwright API mode)  
**Target:** `POST /api/chat` endpoint  
**Run command:** `npm run test:integration`

Integration tests send real HTTP requests to the running Next.js server and verify the full request → validation → AI call → response pipeline. The AI response is mocked to keep tests fast and deterministic.

### Test Cases

| ID | Test | Expected Result |
|----|------|-----------------|
| I-01 | Valid request with one user message | Returns `200` with `{ reply: string }` |
| I-02 | Valid request with multi-turn conversation | Returns `200`, context is forwarded correctly |
| I-03 | Empty messages array | Returns `400` |
| I-04 | Malformed JSON body | Returns `400` |
| I-05 | AI provider is offline (mock timeout) | Returns error response, does not hang indefinitely |
| I-06 | AI provider returns unexpected format | Returns graceful error, does not crash the server |
| I-07 | Request with 2000+ character message | Accepted or rejected based on configured limits |

### Why These Tests Matter
Integration tests catch the exact class of bugs that are hardest to debug in production — wrong endpoint URL, mismatched response format, missing environment variable. These are also the tests that would have caught the WSL networking issue early in development.

---

## Layer 4 — End-to-End (E2E) Tests

**Tool:** Playwright  
**Target:** Full app at `http://localhost:3000`  
**Run command:** `npm run test:e2e`

E2E tests launch a real browser (Chromium, Firefox, WebKit) and simulate exactly what a user does — typing, clicking, waiting, reading. Nothing is mocked.

### Test Cases

| ID | Test | Expected Result |
|----|------|-----------------|
| E-01 | Page load | Title "TinyTales AI" visible, no console errors |
| E-02 | Ask "What are black holes?" | Typing indicator appears, then story card with Pip's reply |
| E-03 | Pip response format | Reply opens with "Once upon a time…", "Imagine if…", or "You know how…" |
| E-04 | Pip response format | Reply closes with "Pretty cool, right? ✨" |
| E-05 | Quick-Ask pill click | Fills input, submit sends the question |
| E-06 | Multi-turn conversation | Second question uses previous context |
| E-07 | Enter key submits | Pressing Enter triggers the same flow as clicking the button |
| E-08 | Mobile viewport (iPhone SE) | Layout renders correctly, spiral rings hidden |
| E-09 | Slow network (throttled) | Typing indicator stays visible until response arrives |
| E-10 | Cross-browser: Chrome | Full flow works in Chromium |
| E-11 | Cross-browser: Firefox | Full flow works in Firefox |
| E-12 | Cross-browser: Safari/WebKit | Full flow works in WebKit |

### Why These Tests Matter
E2E tests are the highest-confidence signal that the app works as a real user experiences it. They're the automated equivalent of the manual pre-demo checklist (`docs/pre-demo-checklist.md`), and they run across all 3 browsers automatically.

---

## Manual Testing

The pre-demo manual checklist at [`docs/pre-demo-checklist.md`](./pre-demo-checklist.md) complements automated tests with checks that are difficult to automate:

- Visual design fidelity (fonts, colours, page-curl corner, tape strip)
- Live AI response quality (does Pip actually sound like Pip?)
- Real device testing (actual phone, not just a simulated viewport)
- Slow network feel (subjective UX, not just functional pass/fail)

---

## Test Coverage Priority

Not all tests need to be written at once. This is the recommended order:

```
Priority 1 (MVP)
├── I-01  Valid chat request returns a reply          ← Core functionality
├── I-03  Empty messages rejected                     ← Security boundary
├── C-01  App renders without crashing               ← Smoke test
└── E-01  Page loads in browser                      ← Smoke test

Priority 2 (v1.1)
├── U-03 to U-07  API route edge cases               ← Robustness
├── C-06 to C-09  Chat interaction states            ← UX correctness
└── E-02 to E-07  Core chat flow                     ← Full confidence

Priority 3 (v1.2+)
├── E-08 to E-12  Cross-browser + mobile             ← Broad compatibility
└── I-05 to I-07  Failure modes                      ← Resilience
```

---

## Setup (When Implementing)

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom supertest playwright

# Run unit + component tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests (requires dev server running)
npm run dev &
npm run test:e2e
```

---

## Relationship Between Test Layers

```
Manual Checklist     → "Does it feel right to a human?"
E2E Tests            → "Does the full flow work in a real browser?"
Integration Tests    → "Does the API respond correctly?"
Component Tests      → "Does the UI render and interact correctly?"
Unit Tests           → "Does the logic handle edge cases?"
```

Each layer catches different bugs. The sweet spot for a project this size is:
**Unit + Integration tests for the backend, E2E smoke tests for the frontend.**

---

*Last updated: 2026-07-08 | Status: Planned for v1.1*
