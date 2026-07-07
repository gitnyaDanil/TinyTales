"use client";

import { useState, useRef, useEffect } from "react";

const QUICK_ASKS = [
  "What are black holes?",
  "Why is the sky blue?",
  "How does Wi-Fi work?",
  "What is gravity?",
];

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --desk:       #C4A882;
    --paper:      #FAF4E4;
    --parchment:  #EDE0C4;
    --line:       rgba(100, 130, 210, 0.17);
    --red-margin: rgba(205, 65, 50, 0.55);
    --ink:        #2C1A0E;
    --ink-mid:    #7A5C4E;
    --sage:       #6BA594;
    --sage-dark:  #4E8272;
    --yellow:     #FFF5A8;
    --yellow-b:   rgba(218, 182, 42, 0.45);
    --ring-color: #C0965A;
    --white:      #FFFFFF;
  }

  html, body { height: 100%; }

  body {
    height: 100%;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    background: var(--desk);
    overflow: hidden;
  }

  .root { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  .hdr {
    background: var(--paper);
    border-bottom: 2px solid var(--parchment);
    padding: 10px 20px;
    flex-shrink: 0;
    box-shadow: 0 3px 12px rgba(80,40,10,0.2);
    z-index: 10;
  }

  .hdr-in {
    max-width: 780px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand { display: flex; align-items: center; gap: 10px; }
  .logo-emoji { font-size: 30px; line-height: 1; }

  .logo-name {
    font-family: 'Lora', Georgia, serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.25;
  }

  .logo-tagline {
    font-family: 'Patrick Hand', cursive;
    font-size: 12px;
    color: var(--ink-mid);
    display: block;
    margin-top: 1px;
  }

  .pip-pill {
    font-family: 'Patrick Hand', cursive;
    font-size: 13px;
    color: var(--sage);
    border: 1.5px dashed var(--sage);
    background: rgba(107,165,148,0.1);
    padding: 3px 12px;
    border-radius: 20px;
  }

  .desk-wrap {
    flex: 1;
    overflow: hidden;
    display: flex;
    justify-content: center;
    padding: 18px 16px 0;
  }

  .notebook {
    display: flex;
    width: 100%;
    max-width: 820px;
    height: 100%;
    filter: drop-shadow(0 8px 28px rgba(50,25,5,0.4));
  }

  .spiral {
    width: 30px;
    flex-shrink: 0;
    background: var(--parchment);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    padding: 12px 0;
    border-radius: 6px 0 0 0;
    border: 1px solid rgba(80,50,20,0.18);
    border-right: none;
  }

  .ring {
    width: 17px; height: 17px;
    border: 2.5px solid var(--ring-color);
    border-radius: 50%;
    background: var(--desk);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.12);
  }

  .page {
    flex: 1;
    overflow-y: auto;
    background-color: var(--paper);
    background-image:
      linear-gradient(to right, transparent 52px, var(--red-margin) 52px, var(--red-margin) 54.5px, transparent 54.5px),
      repeating-linear-gradient(transparent, transparent 31px, var(--line) 31px, var(--line) 32px);
    border-top-right-radius: 4px;
    padding: 22px 22px 28px 70px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .page::-webkit-scrollbar       { width: 5px; }
  .page::-webkit-scrollbar-track { background: transparent; }
  .page::-webkit-scrollbar-thumb { background: var(--parchment); border-radius: 3px; }

  .ai-row { display: flex; align-items: flex-start; gap: 10px; }

  .pip-ava {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: var(--sage);
    color: #fff;
    font-family: 'Lora', serif;
    font-size: 10px;
    font-weight: 600;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.16);
  }

  .story-card {
    background: var(--white);
    border-left: 3.5px solid var(--sage);
    border-radius: 2px 8px 8px 8px;
    padding: 13px 18px;
    max-width: 82%;
    font-size: 15px;
    line-height: 1.82;
    color: var(--ink);
    white-space: pre-wrap;
    word-break: break-word;
    box-shadow: 1px 3px 10px rgba(80,50,20,0.11), 0 0 0 1px rgba(200,160,80,0.16);
    position: relative;
  }

  .story-card::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    border-style: solid;
    border-width: 0 0 15px 15px;
    border-color: transparent transparent var(--parchment) transparent;
  }

  .story-card.typing {
    display: flex; align-items: center; gap: 7px;
    padding: 15px 22px; min-height: 50px;
  }

  .typing span {
    display: block; width: 8px; height: 8px;
    border-radius: 50%; background: var(--sage);
    animation: blink 1.4s infinite ease-in-out;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes blink {
    0%,80%,100% { opacity: 0.25; transform: scale(0.8); }
    40%          { opacity: 1;    transform: scale(1.2); }
  }

  .user-row { display: flex; justify-content: flex-end; }

  .sticky-note {
    background: var(--yellow);
    padding: 12px 16px 14px;
    max-width: 68%;
    font-family: 'Patrick Hand', cursive;
    font-size: 16px;
    line-height: 1.65;
    color: var(--ink);
    border-radius: 2px;
    transform: rotate(0.4deg);
    position: relative;
    word-break: break-word;
    box-shadow: 2px 4px 10px rgba(80,50,20,0.18), 0 0 0 1px rgba(218,182,42,0.35);
  }

  .sticky-note::before {
    content: '';
    position: absolute;
    top: -6px; left: 50%;
    transform: translateX(-50%);
    width: 38px; height: 9px;
    background: var(--yellow-b);
    border-radius: 2px;
  }

  .ftr {
    background: var(--paper);
    border-top: 2px solid var(--parchment);
    padding: 12px 20px 14px;
    flex-shrink: 0;
    box-shadow: 0 -3px 14px rgba(80,50,20,0.1);
  }

  .ftr-in {
    max-width: 780px;
    margin: 0 auto 9px;
    display: flex; gap: 10px;
  }

  .input-box {
    flex: 1;
    display: flex; align-items: center; gap: 8px;
    background: var(--white);
    border: 1.5px solid var(--parchment);
    border-radius: 8px;
    padding: 8px 14px;
    cursor: text;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .input-box:focus-within {
    border-color: var(--sage);
    box-shadow: 0 0 0 3px rgba(107,165,148,0.15);
  }

  .pencil-ico { font-size: 17px; user-select: none; flex-shrink: 0; }

  .input-box input {
    flex: 1; border: none; outline: none;
    background: transparent;
    font-family: 'Patrick Hand', cursive;
    font-size: 16px; color: var(--ink);
  }

  .input-box input::placeholder { color: #B09070; font-style: italic; }

  .ask-btn {
    background: var(--sage);
    color: #fff; border: none;
    border-radius: 8px; padding: 0 20px;
    font-family: 'Nunito', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer; white-space: nowrap;
    min-height: 44px;
    transition: background 0.15s, transform 0.1s;
  }

  .ask-btn:hover:not(:disabled)  { background: var(--sage-dark); transform: translateY(-1px); }
  .ask-btn:active:not(:disabled) { transform: translateY(0); }
  .ask-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  .quick-row {
    max-width: 780px; margin: 0 auto;
    display: flex; gap: 7px; flex-wrap: wrap;
  }

  .quick-pill {
    background: transparent;
    border: 1.5px dashed var(--parchment);
    border-radius: 20px; padding: 3px 12px;
    font-family: 'Patrick Hand', cursive;
    font-size: 13px; color: var(--ink-mid);
    cursor: pointer; transition: all 0.15s;
  }

  .quick-pill:hover {
    border-color: var(--sage); color: var(--sage-dark);
    background: rgba(107,165,148,0.08);
  }

  .error-banner {
    background: #FFF0F0; border: 1px solid #FFCCCC;
    border-radius: 8px; padding: 8px 14px;
    font-size: 13px; color: #C04040;
    text-align: center; margin: 0 auto 8px;
    max-width: 780px;
  }

  @media (max-width: 480px) {
    .spiral  { display: none; }
    .page    { padding-left: 20px; }
    .story-card  { max-width: 94%; }
    .sticky-note { max-width: 90%; }
    .pip-pill    { display: none; }
  }
`;

export default function Home() {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content:
        "Hi there! I'm Pip \u2728 \u2014 your guide to the universe, one tiny story at a time.\n\nAsk me anything \u2014 like 'what are black holes?' or 'how does Wi-Fi work?' \u2014 and I'll turn it into a little tale that makes total sense. What are you curious about?",
    },
  ]);
  const [draft, setDraft]       = useState("");
  const [busy, setBusy]         = useState(false);
  const [apiError, setApiError] = useState("");
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("link");
    el.rel  = "stylesheet";
    el.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Nunito:wght@400;600;700;800&family=Patrick+Hand&display=swap";
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || busy) return;

    setApiError("");
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setDraft("");
    setBusy(true);
    inputRef.current?.focus();

    try {
      // Calls our server-side route — API key stays on the server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setMsgs((p) => [...p, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
      setMsgs((p) => [
        ...p,
        { role: "assistant", content: "Oops! I got distracted by a butterfly. Ask me again? \uD83E\uDD8B" },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const quickAsk = (q) => { setDraft(q); inputRef.current?.focus(); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="root">

        <header className="hdr">
          <div className="hdr-in">
            <div className="brand">
              <span className="logo-emoji">📖</span>
              <div>
                <h1 className="logo-name">TinyTales AI</h1>
                <span className="logo-tagline">big ideas · tiny words</span>
              </div>
            </div>
            <span className="pip-pill">Pip is ready ✨</span>
          </div>
        </header>

        <div className="desk-wrap">
          <div className="notebook">
            <div className="spiral">
              {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className="ring" />
              ))}
            </div>

            <div className="page">
              {msgs.map((m, i) =>
                m.role === "assistant" ? (
                  <div key={i} className="ai-row">
                    <div className="pip-ava">Pip</div>
                    <div className="story-card">{m.content}</div>
                  </div>
                ) : (
                  <div key={i} className="user-row">
                    <div className="sticky-note">{m.content}</div>
                  </div>
                )
              )}

              {busy && (
                <div className="ai-row">
                  <div className="pip-ava">Pip</div>
                  <div className="story-card typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>
        </div>

        <footer className="ftr">
          {apiError && <p className="error-banner">{apiError}</p>}
          <div className="ftr-in">
            <label className="input-box">
              <span className="pencil-ico">✏️</span>
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Ask me anything, like 'what are stars?'"
                disabled={busy}
              />
            </label>
            <button
              className="ask-btn"
              onClick={submit}
              disabled={busy || !draft.trim()}
            >
              Ask Pip →
            </button>
          </div>

          <div className="quick-row">
            {QUICK_ASKS.map((q) => (
              <button key={q} className="quick-pill" onClick={() => quickAsk(q)}>
                {q}
              </button>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}
