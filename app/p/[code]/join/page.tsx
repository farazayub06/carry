/**
 * app/p/[code]/join/page.tsx — JOIN  (route: /p/<code>/join)
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 * CORE FLOW STEP 4. This is where the group chat link lands.
 *
 * WHAT HAPPENS:
 *   1. Load the project: GET /api/p/<code>
 *   2. Show every member as a big tappable button (with their color/initial)
 *   3. On tap: localStorage.setItem(`carry:me:<code>`, member.id)
 *   4. Navigate to the dashboard: /p/<code>
 *
 * No sign-up, no password. Keep this screen DEAD simple: it's the first
 * thing teammates see, and if it's confusing they go back to the group chat
 * and never return.
 *
 * Reads the code from the URL → use the <Suspense> + "use client" screen
 * pattern explained in app/p/[code]/page.tsx.
 *
 * TODO (Frontend):
 *   [ ] Create JoinScreen.tsx ("use client"), render it here inside <Suspense>
 *   [ ] Member buttons (min ~56px tall so they're easy to tap)
 *   [ ] Highlight the member already saved as "me", if any
 *   [ ] Friendly error if the code doesn't exist
 */

export default function JoinPage() {
  return (
    <main className="pt-6">
      <h1 className="text-2xl font-bold">Which one are you?</h1>
      <p className="mt-2 text-sm text-muted">TODO: name picker. See the comment at the top of app/p/[code]/join/page.tsx.</p>
    </main>
  );
}
