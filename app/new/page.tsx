/**
 * app/new/page.tsx — CREATE PROJECT  (route: /new)
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 * CORE FLOW STEP 1 (see the PRD).
 *
 * RECOMMENDED PATTERN for every page in this app:
 *   page.tsx            → thin Server Component, just renders the screen
 *   SomethingForm.tsx   → "use client" at the top, holds the real UI + state
 * (Forms need useState / onClick, which only work in client components.)
 *
 * WHAT THE FORM NEEDS:
 *   - Project name
 *   - Real due date            (<input type="date">)
 *   - Teammate names           (first one = "you", the organizer; min 2 people)
 *   - Assignment prompt        (big textarea, required)
 *   - Rubric                   (textarea, optional; the AI plan is better with it)
 *
 * ON SUBMIT:
 *   1. POST /api/projects with a CreateProjectInput body (lib/types.ts)
 *      → returns ProjectState (project + members)
 *   2. Remember the organizer as "me" for this project, e.g.
 *        localStorage.setItem(`carry:me:${project.share_code}`, members[0].id)
 *      (No accounts! Identity = a member id saved in this browser.)
 *   3. Navigate to /p/<share_code>/plan with useRouter().push(...)
 *
 * TODO (Frontend):
 *   [ ] Create app/new/NewProjectForm.tsx ("use client") and render it here
 *   [ ] Build the fields above, with validation + a loading state on submit
 *   [ ] Show API errors to the user (the API returns { error: "…" })
 *   [ ] Nice to have: a "Fill demo text" button for testing + the demo video
 */

export default function NewProjectPage() {
  return (
    <main className="pt-6">
      <h1 className="text-2xl font-bold">New group project</h1>
      <p className="mt-2 text-sm text-muted">TODO: create-project form. See the comment at the top of app/new/page.tsx.</p>
    </main>
  );
}
