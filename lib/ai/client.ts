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
 *   [ ] aiEnabled(): true when the key env var is set
 *   [ ] askModel(): request + timeout + return text or null (log errors, never throw)
 */

import "server-only"; // build fails if a "use client" file imports this → protects the API key

export function aiEnabled(): boolean {
  // TODO
  return false;
}

export async function askModel(system: string, user: string, maxTokens = 1500): Promise<string | null> {
  // TODO: implement (see hints above). Returning null = "AI is off" → callers use fallbacks.
  void system;
  void user;
  void maxTokens;
  return null;
}
