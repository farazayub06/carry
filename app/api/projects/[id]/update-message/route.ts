/**
 * GET /api/projects/[id]/update-message — AI-written group chat update
 * ---------------------------------------------------------------------------
 * OWNER: Backend (route) · AI lead owns lib/ai/updateMessage.ts
 * CALLED BY: the "📣 Copy update" button on the dashboard
 * RETURNS: { message: string, source: "ai" | "fallback" }
 * The frontend copies `message`; a student pastes it into Snapchat/iMessage.
 */

import { store } from "@/lib/db";
import { writeUpdate } from "@/lib/ai/updateMessage";

export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[id]/update-message">) {
  const { id } = await ctx.params;

  const state = await store.getStateById(id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });

  return Response.json(await writeUpdate(state));
}