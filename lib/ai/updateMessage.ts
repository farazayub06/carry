/**
 * lib/ai/updateMessage.ts — FEATURE: "📣 Copy update" for the group chat
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * Snapchat and iMessage don't allow bots, so instead of posting FOR the group,
 * Carry WRITES the message and a student pastes it in with one tap. That's
 * how we plug into the group chat without needing those apps' permission.
 *
 * TONE RULES (this is what makes Carry feel neutral, not bossy):
 *   - short: max ~6 lines / ~60 words, phone-friendly, 1–3 emoji
 *   - line 1: progress ("3 of 9 tasks done") + time until the due date
 *   - then who's up next and on what (first names), soonest deadline first
 *   - overdue work is mentioned kindly as "still open". Never shame anyone.
 *   - if tasks are unclaimed, end by inviting people to grab one
 *
 * Send the model a COMPACT summary (one line per task: title | owner |
 * status | overdue? | due in N days), not the whole raw state.
 * Ask for JSON {"message":"..."} so it's easy to validate.
 *
 * TODO (AI):
 *   [ ] SYSTEM prompt with the tone rules
 *   [ ] build the compact summary
 *   [ ] writeUpdate(): askJson → else fallbackUpdate()
 */

import "server-only";
import type { ProjectState } from "../types";
import { fallbackUpdate } from "./fallback";

export async function writeUpdate(state: ProjectState): Promise<{ message: string; source: "ai" | "fallback" }> {
  // TODO: AI version (see above). For now, always the fallback:
  return { message: fallbackUpdate(state), source: "fallback" };
}
