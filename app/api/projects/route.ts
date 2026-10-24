/**
 * POST /api/projects — create a new group project
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: the create-project form (app/new)
 *
 * BODY:    CreateProjectInput (lib/types.ts): { name, assignment_text, rubric_text, due_at, member_names[] }
 * RETURNS: ProjectState (project + members, no tasks yet)
 *
 * TODO (Backend):
 *   [ ] Validate: name + assignment_text required, at least 2 member_names, due_at is a real date
 *   [ ] Trim names, drop empty ones, cap at ~8 members
 *   [ ] return store.createProject({...})
 *   [ ] (The frontend saves members[0] (the organizer) as "me" so they skip the join screen)
 *
 * ALL ROUTES, SHARED RULES (Backend):
 *   - Read params with `const { id } = await ctx.params;` (params is a Promise in this Next.js version)
 *   - Read the body with `await req.json()` (wrap in try/catch → 400 if it isn't JSON)
 *   - Talk to the database ONLY through `store` from "@/lib/db" (never Supabase directly)
 *   - Success → `Response.json(data)`; errors → `Response.json({ error: "message" }, { status: 400/404 })`
 *     (tip: write one small `handle()` wrapper so every route does this the same way;
 *      catch StoreError from "@/lib/db" and use its .status)
 *   - Until this route is done it returns 501 "Not implemented", so the frontend can see what's missing
 */

export async function POST(req: Request) {
  // TODO: implement (see the comment above). Start with: const body = await req.json();
  void req;
  return Response.json({ error: "Not implemented yet: POST /api/projects" }, { status: 501 });
}
