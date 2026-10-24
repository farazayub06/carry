/** Minimal Anthropic Messages API client. Returns null on any failure so callers fall back. */

import "server-only"; // build fails if a "use client" file imports this → protects the API key

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5-5";
const TIMEOUT_MS = 25_000;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function askModel(system: string, user: string, maxTokens = 1500): Promise<string | null> {
  if (!aiEnabled()) return null;

  // Abort slow requests so a hung API call can't freeze the demo.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || DEFAULT_MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[ai] ${res.status} ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    // Timeout, no Wi-Fi, bad JSON from the API… all mean "AI is off" → fallback.
    console.error("[ai] request failed:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
