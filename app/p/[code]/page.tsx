/**
 * app/p/[code]/page.tsx — TEAM DASHBOARD  (route: /p/<share code>, e.g. /p/demo42)
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 * CORE FLOW STEPS 5–8. This is the screen everyone lives on.
 *
 * ⚠️  IMPORTANT, THIS VERSION OF NEXT.JS (read before building any /p/[code] page):
 * next.config.ts has `cacheComponents: true`, which prerenders pages by
 * default. The share code in the URL isn't known until someone opens the
 * link, so any client component that reads it with `useParams()` MUST be
 * wrapped in <Suspense>, or `npm run build` fails. Use this pattern:
 *
 *     // page.tsx (this file, Server Component)
 *     import { Suspense } from "react";
 *     export default function Page() {
 *       return <Suspense fallback={<p>Loading…</p>}><DashboardScreen /></Suspense>;
 *     }
 *
 *     // DashboardScreen.tsx
 *     "use client";
 *     import { useParams } from "next/navigation";
 *     export function DashboardScreen() {
 *       const { code } = useParams<{ code: string }>();
 *       …
 *     }
 *
 * DATA:
 *   GET /api/p/<code> → ProjectState { project, members, tasks, events }
 *   Re-fetch every ~5 seconds (setInterval) so teammates' changes show up live.
 *   Read "me" from localStorage (`carry:me:<code>`). If not set → redirect to /p/<code>/join.
 *
 * LAYOUT (top → bottom, by what a student needs first):
 *   1. Header: project name, "You're Maya · switch", link to the receipt
 *   2. Progress: % of effort done + days until the REAL due date
 *   3. "📣 Copy update" button (GET /api/projects/[id]/update-message → clipboard)
 *      + "🔗 Invite link" button → /p/<code>/share
 *   4. <WorkloadBar>: is the split fair?
 *   5. Task lists, each task in exactly one section:
 *        Needs attention → isAtRisk() in lib/utils.ts (overdue, stuck, due soon + not started)
 *        Up for grabs    → no owner
 *        On track        → everything else (done tasks at the bottom)
 *   6. Tap a <TaskCard> → open <TaskSheet> (claim / status / confirm / stuck help)
 *   If there are no tasks yet → show a "Build the plan" button → /p/<code>/plan
 *
 * TODO (Frontend):
 *   [ ] Create DashboardScreen.tsx ("use client") and render it here inside <Suspense>
 *   [ ] Fetch + poll the project state; handle loading and "project not found"
 *   [ ] Build the layout above using the components in /components
 */

export default function DashboardPage() {
  return (
    <main className="pt-6">
      <h1 className="text-2xl font-bold">Team dashboard</h1>
      <p className="mt-2 text-sm text-muted">TODO: dashboard. See the comment at the top of app/p/[code]/page.tsx.</p>
    </main>
  );
}
