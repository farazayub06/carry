/** JSON extraction, validation with one retry, and field cleaners for model output. */

import "server-only";
import { askModel } from "./client";

/** Pull the first JSON object out of a model reply. null if there isn't a valid one. */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  // Walk to the brace that closes the first "{", ignoring braces inside strings,
  // so trailing chatter after the object can't confuse us. Raw newlines/tabs
  // inside strings (invalid JSON, but models write them in multi-line messages)
  // are escaped on the way.
  let json = "";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    let ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      else if (ch === "\n") ch = "\\n";
      else if (ch === "\r") ch = "\\r";
      else if (ch === "\t") ch = "\\t";
    } else if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") depth--;
    json += ch;

    if (depth === 0) {
      try {
        return JSON.parse(json);
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
