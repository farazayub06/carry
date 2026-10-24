/**
 * scripts/seed.ts — loads the DEMO project into Supabase
 * ---------------------------------------------------------------------------
 * OWNER: Backend (story/data comes from lib/mock.ts, written by Product)
 *
 * RUN:  npm run seed
 *
 *   1. Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 *   2. Deletes the old demo project (share code "demo42") so it's safe to re-run
 *   3. Inserts the demo project, members, tasks and event history
 *
 * Re-run it right before recording the video so the dates look fresh
 * (all mock dates are relative to "now").
 *
 * WHY THE ID MAPPING? The mock uses readable ids ("m-maya", "t-1") but
 * Postgres columns are UUIDs. So we make a real UUID for each mock id and
 * translate every reference (owner_id, confirmed_by, task_id…) through a Map.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { buildDemoState, DEMO_CODE } from "../lib/mock";

config({ path: ".env.local" });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const demo = buildDemoState();

  // mock id → real uuid (the same mock id always maps to the same uuid)
  const ids = new Map<string, string>();
  const real = (mockId: string | null) => {
    if (!mockId) return null;
    if (!ids.has(mockId)) ids.set(mockId, crypto.randomUUID());
    return ids.get(mockId)!;
  };

  // 1. Remove the previous demo (cascades to its members, tasks, events).
  await sb.from("projects").delete().eq("share_code", DEMO_CODE);

  // 2. Project
  const { project } = demo;
  let res = await sb.from("projects").insert({
    id: real(project.id),
    name: project.name,
    assignment_text: project.assignment_text,
    rubric_text: project.rubric_text,
    due_at: project.due_at,
    share_code: project.share_code,
    created_at: project.created_at,
  });
  if (res.error) throw res.error;

  // 3. Members, one at a time so join order is preserved
  for (const m of demo.members) {
    res = await sb.from("members").insert({
      id: real(m.id),
      project_id: real(m.project_id),
      name: m.name,
      email: m.email,
      color: m.color,
    });
    if (res.error) throw res.error;
  }

  // 4. Tasks
  res = await sb.from("tasks").insert(
    demo.tasks.map((t) => ({
      id: real(t.id),
      project_id: real(t.project_id),
      title: t.title,
      description: t.description,
      effort: t.effort,
      internal_due_at: t.internal_due_at,
      owner_id: real(t.owner_id),
      status: t.status,
      completed_at: t.completed_at,
      confirmed_by: real(t.confirmed_by),
      position: t.position,
    })),
  );
  if (res.error) throw res.error;

  // 5. Event history
  res = await sb.from("events").insert(
    demo.events.map((e) => ({
      project_id: real(e.project_id),
      member_id: real(e.member_id),
      task_id: real(e.task_id),
      type: e.type,
      meta: e.meta,
      created_at: e.created_at,
    })),
  );
  if (res.error) throw res.error;

  console.log(`✅ Seeded demo project. Open /p/${DEMO_CODE}`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message ?? err);
  process.exit(1);
});