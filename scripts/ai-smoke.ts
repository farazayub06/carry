/** Checks the Anthropic key: npx tsx --conditions=react-server scripts/ai-smoke.ts */

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { aiEnabled, askModel } = await import("../lib/ai/client");
  console.log("aiEnabled:", aiEnabled());
  const reply = await askModel("You are a terse assistant.", "Reply with exactly: Carry AI is online", 50);
  console.log("reply:", reply);
}

main();
