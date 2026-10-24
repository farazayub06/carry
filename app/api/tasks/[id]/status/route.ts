/**
 * POST /api/tasks/[id]/status — move a task between statuses
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * BODY:    { member_id, status }   status ∈ not_started | in_progress | stuck | done
 * RETURNS: the updated Task. The store logs "completed" or "status_changed".
 */

import { store, StoreError } from "@/lib/db";
import type { TaskStatus } from "@/lib/types";

const VALID: TaskStatus[] = ["not_started", "in_progress", "stuck", "done"];

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/status">) {
  const { id } = await ctx.params;

  let body: { member_id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }
  if (!body.member_id) return Response.json({ error: 'Missing "member_id"' }, { status: 400 });

  // Only accept one of the 4 real statuses.
  const status = body.status as TaskStatus;
  if (!VALID.includes(status)) {
    return Response.json({ error: `status must be one of: ${VALID.join(", ")}` }, { status: 400 });
  }

  try {
    return Response.json(await store.setStatus(id, body.member_id, status));
  } catch (err) {
    if (err instanceof StoreError) return Response.json({ error: err.message }, { status: err.status });
    throw err;
  }
}