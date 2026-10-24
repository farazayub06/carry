/**
 * POST /api/tasks/[id]/confirm — a TEAMMATE confirms a done task is really done
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * BODY:    { member_id }   ← must NOT be the task owner (the store enforces this)
 * RETURNS: the updated Task. The store logs a "confirmed" event.
 * Our answer to the judge question "can't people fake the log?"
 */

import { store, StoreError } from "@/lib/db";

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/confirm">) {
  const { id } = await ctx.params;

  let body: { member_id?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }
  if (!body.member_id) return Response.json({ error: 'Missing "member_id"' }, { status: 400 });

  try {
    return Response.json(await store.confirmTask(id, body.member_id));
  } catch (err) {
    if (err instanceof StoreError) return Response.json({ error: err.message }, { status: err.status });
    throw err;
  }
}