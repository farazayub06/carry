/** GET /api/projects/[id]/update-message: group chat progress update. */

import { store } from "@/lib/db";
import { writeUpdate } from "@/lib/ai/updateMessage";

export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[id]/update-message">) {
  const { id } = await ctx.params;

  const state = await store.getStateById(id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });

  return Response.json(await writeUpdate(state));
}