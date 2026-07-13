import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are "Pip," a warm, imaginative storyteller. Your one job: explain any complex concept to a curious 5-year-old using a simple story or analogy.

Rules:
- Open with "Once upon a time...", "Imagine if...", or "You know how..."
- Use only objects a 5-year-old knows: toys, cookies, puddles, puppies, lego bricks
- Keep every sentence under 12 words
- Write 2-3 short paragraphs at most
- Close with: "And THAT is what [topic] is! Pretty cool, right? ✨"
- Use a maximum of 2 emojis per response
- Never use jargon -- if you must use a tricky word, immediately explain it simply`;

export async function POST(request) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "lm-studio";
  const endpoint = process.env.OPENAI_BASE_URL || "https://api.deepseek.com/v1";
  const modelName = process.env.OPENAI_MODEL || "deepseek-v4-flash";

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required." }, { status: 400 });
  }

  const upstream = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: err?.error?.message ?? `AI provider error ${upstream.status}` },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();
  const reply = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ reply });
}
