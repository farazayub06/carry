/** POST /api/projects: create a project and its members. */

import { store } from "@/lib/db";
import type { CreateProjectInput } from "@/lib/types";

/** Small helper so every error looks the same: { error: "..." } + a status code. */
const fail = (message: string, status = 400) => Response.json({ error: message }, { status });

export async function POST(req: Request) {
  let body: Partial<CreateProjectInput>;
  try {
    body = await req.json();
  } catch {
    return fail("Request body must be JSON");
  }
  const name = String(body.name ?? "").trim();
  const assignment_text = String(body.assignment_text ?? "").trim();
  const rubric_text = String(body.rubric_text ?? "").trim(); // optional
  const member_names = (body.member_names ?? [])
    .map((n) => String(n).trim()) // remove extra spaces
    .filter(Boolean) //               drop empty names
    .slice(0, 8); //                  cap the group size
  const due = new Date(String(body.due_at ?? ""));

  if (!name) return fail("Give the project a name");
  if (!assignment_text) return fail("Paste the assignment prompt");
  if (member_names.length < 2) return fail("Add at least 2 teammates");
  if (Number.isNaN(due.getTime())) return fail("Pick a real due date");
  const state = await store.createProject({
    name,
    assignment_text,
    rubric_text,
    due_at: due.toISOString(),
    member_names,
  });
  return Response.json(state);
}