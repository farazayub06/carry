/**
 * scripts/seed.ts — loads the DEMO project into Supabase
 * ---------------------------------------------------------------------------
 * OWNER: Backend (the story/data comes from lib/mock.ts, written by Product)
 *
 * RUN:  npm run seed
 *
 * WHAT IT SHOULD DO:
 *   1. Read SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 *        import { config } from "dotenv"; config({ path: ".env.local" });
 *   2. Delete the old demo project (share_code "demo42") so it's safe to re-run
 *      (deleting the project cascades to members, tasks and events)
 *   3. Insert buildDemoState() from lib/mock.ts: project → members → tasks → events
 *   4. Print "✅ Seeded demo project. Open /p/demo42"
 *
 * GOTCHA, ID MAPPING:
 * The mock uses readable ids ("m-maya", "t-1") but Postgres columns are UUIDs.
 * Generate a crypto.randomUUID() for each mock id (keep a Map<mockId, uuid>)
 * and translate every reference (owner_id, confirmed_by, member_id, task_id…).
 *
 * Re-run it right before recording the video so the relative dates look fresh.
 *
 * TODO (Backend): implement steps 1–4.
 */

import { buildDemoState, DEMO_CODE } from "../lib/mock";

async function main() {
  const demo = buildDemoState();
  // TODO: implement (see above)
  console.log(`TODO: seed ${demo.members.length} members + ${demo.tasks.length} tasks for /p/${DEMO_CODE}`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
