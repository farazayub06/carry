/**
 * app/p/[code]/plan/page.tsx — REVIEW THE AI PLAN  (route: /p/<code>/plan)
 * ---------------------------------------------------------------------------
 * OWNER: Frontend (UI) + AI (quality of what shows up here)
 * CORE FLOW STEP 2. First "wow" moment of the demo.
 *
 * WHAT HAPPENS:
 *   1. Load the project: GET /api/p/<code> (you need project.id)
 *   2. Ask the AI for a DRAFT: POST /api/projects/<id>/plan
 *        → PlanResult { tasks: DraftTask[], rubric_items, source: "ai" | "fallback" }
 *      Show a loading message ("Reading your assignment…") while it thinks.
 *      Only call it ONCE per visit (use a useRef flag; effects can run twice in dev).
 *   3. Show each draft task as an editable card:
 *        title (input) · description (textarea) · effort 1–5 (select) · our deadline (date input) · remove ✕
 *      + "Add a task" button
 *      + a summary line: "8 tasks · 22 effort pts · about 6 pts each"
 *   4. "Save plan" (sticky at the bottom on phones):
 *        PUT /api/projects/<id>/tasks with { tasks: DraftTask[] }
 *        → then navigate to /p/<code>/share
 *
 * If the project ALREADY has tasks, don't silently overwrite them: show
 * "Plan already saved" with "Go to dashboard" and "Rebuild with AI" buttons.
 *
 * RESPONSIBLE AI: "AI drafts, humans decide." Making the edit controls
 * obvious is part of our pitch to the judges.
 *
 * Uses the <Suspense> + "use client" screen pattern from app/p/[code]/page.tsx.
 *
 * TODO (Frontend):
 *   [ ] Create PlanScreen.tsx ("use client"), render it here inside <Suspense>
 *   [ ] Steps 1–4 above
 *   [ ] If source === "fallback", show a small note: "AI unavailable, so this is a starter plan"
 */

export default function PlanPage() {
  return (
    <main className="pt-6">
      <h1 className="text-2xl font-bold">Review your plan</h1>
      <p className="mt-2 text-sm text-muted">TODO: AI plan editor. See the comment at the top of app/p/[code]/plan/page.tsx.</p>
    </main>
  );
}
