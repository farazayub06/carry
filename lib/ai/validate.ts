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
 *   [ ] extractJson
 *   [ ] askJson with one retry
 *   [ ] the small cleaners at the bottom (used by every validator)
 */

import "server-only";
import { askModel } from "./client";

/** Pull the first JSON object out of a model reply. null if there isn't a valid one. */
export function extractJson(text: string): unknown {
  // TODO
  void text;
  return null;
}

/** Ask for JSON, validate it, retry once. null = give up → caller uses its fallback. */
export async function askJson<T>(
  system: string,
  user: string,
  validate: (raw: unknown) => T | null,
  maxTokens?: number,
): Promise<T | null> {
  // TODO: loop twice: askModel → if null return null → extractJson → validate → return if valid
  const text = await askModel(system, user, maxTokens);
  if (text === null) return null;
  return validate(extractJson(text));
}

/* ---------- small cleaners every validator uses (TODO: implement) ---------- */

/** Is it a plain object (not null, not an array)? */
export const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** TODO: a trimmed string capped at `max` chars, or "" if it isn't a string. */
export const str = (x: unknown, max = 300): string => {
  void max;
  return typeof x === "string" ? x : "";
};

/** TODO: an array of non-empty cleaned strings, at most `maxItems`. */
export const strList = (x: unknown, maxItems = 12): string[] => {
  void maxItems;
  return Array.isArray(x) ? x.map((s) => str(s)) : [];
};

/** TODO: an integer clamped to 1–5; anything invalid → 2. */
export const effort = (x: unknown): number => {
  void x;
  return 2;
};
