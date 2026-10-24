/** GET /api/projects/[id]/receipt: per-member contribution rows. */

import { store } from "@/lib/db";
import { computeReceipt } from "@/lib/db/receipt";

export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[id]/receipt">) {
  const { id } = await ctx.params;

  const state = await store.getStateById(id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });

  return Response.json({
    project: state.project,
    rows: computeReceipt(state),
    generated_at: new Date().toISOString(),
  });
}