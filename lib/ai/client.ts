/**
 * lib/ai/client.ts — the ONE place we call the LLM
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * Every AI feature (plan, stuck helper, group-chat update, rubric check) goes
 * through askModel(). Keeping it in one place means:
 *   - the API key lives in exactly one spot (server only, never the browser)
 *   - switching providers later = editing this one file
 *   - one timeout + error policy for everything
 *
 * CONFIG (.env.local):
 *   ANTHROPIC_API_KEY=sk-ant-...   ← or whichever provider's key the team has
 *   AI_MODEL=...                   ← optional model override
 *
 * CONTRACT (other files rely on this):
 *   askModel(system, user, maxTokens) → Promise<string | null>
 *   - returns the model's text reply
 *   - returns null if there's no key, the request fails, or it takes > ~25s
 *     → callers then use their rule-based fallback (lib/ai/fallback.ts),
 *       so the demo NEVER breaks, even if the venue Wi-Fi dies
 *
 * IMPLEMENTATION HINTS (Anthropic Messages API, plain fetch, no SDK needed):
 *   POST https://api.anthropic.com/v1/messages
 *   headers: content-type: application/json · x-api-key: <key> · anthropic-version: 2023-06-01
 *   body:    { model, max_tokens, system, messages: [{ role: "user", content: user }] }
 *   reply:   data.content is a list of blocks; join the `text` of blocks where type === "text"
 *   timeout: AbortController + setTimeout(() => controller.abort(), 25_000)
 *   Check the provider docs for current model names.
 *
 * Using the AWS sandbox (Bedrock), Gemini or OpenAI instead? Replace the
 * request inside askModel; keep the function signature the same.
 *
 * TODO (AI):
 *   [x] aiEnabled(): true when the key env var is set
 *   [x] askModel(): request + timeout + return text or null (log errors, never throw)
 */

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
