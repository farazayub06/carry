/**
 * lib/ai/validate.ts — never trust raw AI output
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * LLMs sometimes wrap JSON in ```code fences```, add a sentence before it,
 * invent fields, or return effort: "medium" instead of a number. This file
 * is the safety layer between the model and our app:
 *
 *   1. extractJson(text)  → find the first {...} in the reply and JSON.parse it
 *                           (strip ```json fences first; return null if it fails)
 *   2. a validator per feature (written in plan.ts, stuck.ts, …) that checks
 *      the shape and CLEANS values (trim strings, clamp effort to 1–5…),
 *      returning null if it's unusable
 *   3. askJson(system, user, validate) → askModel → extractJson → validate,
 *      RETRY ONCE if invalid, return null if both attempts fail
 *      (and return null immediately if askModel returned null, since AI is off)
 *
 * This is the "the AI never breaks the demo" guarantee from the PRD, and a
 * good thing to mention when judges ask about responsible AI.
 *
 * TODO (AI):
 *   [x] extractJson
 *   [x] askJson with one retry
 *   [x] the small cleaners at the bottom (used by every validator)
 */

import "server-only";
import { askModel } from "./client";

/** Pull the first JSON object out of a model reply. null if there isn't a valid one. */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  // Walk to the brace that closes the first "{", ignoring braces inside strings,
  // so trailing chatter after the object can't confuse us.
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      try {
        return JSON.parse(cleaned.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null; // never closed → truncated reply
}

/** Ask for JSON, validate it, retry once. null = give up → caller uses its fallback. */
export async function askJson<T>(
  system: string,
  user: string,
  validate: (raw: unknown) => T | null,
  maxTokens?: number,
): Promise<T | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const prompt =
      attempt === 1 ? user : `${user}\n\nReply with ONLY the JSON object described above. No prose, no code fences.`;
    const text = await askModel(system, prompt, maxTokens);
    if (text === null) return null; // AI is off → don't burn another 25s retrying

    const result = validate(extractJson(text));
    if (result !== null) return result;
    console.warn(`[ai] invalid JSON on attempt ${attempt}`);
  }
  return null;
}

/* ---------- small cleaners every validator uses ---------- */

/** Is it a plain object (not null, not an array)? */
export const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** A trimmed string capped at `max` chars, or "" if it isn't a string. */
export const str = (x: unknown, max = 300): string =>
  typeof x === "string" ? x.trim().slice(0, max) : "";

/** An array of non-empty cleaned strings, at most `maxItems`. */
export const strList = (x: unknown, maxItems = 12): string[] =>
  Array.isArray(x) ? x.map((s) => str(s)).filter(Boolean).slice(0, maxItems) : [];

/** An integer clamped to 1–5; anything invalid → 2. */
export const effort = (x: unknown): number => {
  const n = typeof x === "string" ? Number(x) : x;
  if (typeof n !== "number" || !Number.isFinite(n)) return 2;
  return Math.min(5, Math.max(1, Math.round(n)));
};
