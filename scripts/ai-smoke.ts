/**
 * scripts/ai-smoke.ts — "does my API key work?" in one command
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 *   npx tsx --conditions=react-server scripts/ai-smoke.ts
 *
 * Reads .env.local, sends one tiny prompt through askModel(), prints the reply.
 * Prints "null" if the key is missing or the request failed (check the log above it).
 */

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { aiEnabled, askModel } = await import("../lib/ai/client");
  console.log("aiEnabled:", aiEnabled());
  const reply = await askModel("You are a terse assistant.", "Reply with exactly: Carry AI is online", 50);
  console.log("reply:", reply);
}

main();
