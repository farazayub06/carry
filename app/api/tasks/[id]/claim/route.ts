/** POST /api/tasks/[id]/claim: assign the task to a member (logs "claimed"). */

import { store, StoreError } from "@/lib/db";

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/claim">) {
  const { id } = await ctx.params;

  let body: { member_id?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }
  if (!body.member_id) return Response.json({ error: 'Missing "member_id"' }, { status: 400 });

  try {
    return Response.json(await store.claimTask(id, body.member_id));
  } catch (err) {
    if (err instanceof StoreError) return Response.json({ error: err.message }, { status: err.status });
    throw err;
  }
}