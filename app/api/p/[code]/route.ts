/** GET /api/p/[code]: full project state by share code. */

import { store } from "@/lib/db";

export async function GET(_req: Request, ctx: RouteContext<"/api/p/[code]">) {
  const { code } = await ctx.params;
  const state = await store.getStateByCode(code.toLowerCase());
  if (!state) {
    return Response.json({ error: "No project with that link. Double-check the code." }, { status: 404 });
  }
  return Response.json(state);
}