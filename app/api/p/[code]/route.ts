/**
 * GET /api/p/[code] — EVERYTHING about a project, looked up by share code
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: every screen under /p/[code] (the dashboard polls it every ~5s)
 *
 * RETURNS: ProjectState { project, members, tasks, events }
 */

import { store } from "@/lib/db";

export async function GET(_req: Request, ctx: RouteContext<"/api/p/[code]">) {
  // 1. Get the code from the URL. In this Next.js version, params is a Promise → await it.
  const { code } = await ctx.params;

  // 2. Look it up. lowercase() so "DEMO42" still works.
  const state = await store.getStateByCode(code.toLowerCase());

  // 3. Not found → 404 with a friendly message the frontend can show.
  if (!state) {
    return Response.json({ error: "No project with that link. Double-check the code." }, { status: 404 });
  }

  // 4. Found → send everything back as JSON.
  return Response.json(state);
}