/**
 * app/page.tsx — LANDING PAGE  (route: /)
 * ---------------------------------------------------------------------------
 * OWNER: Frontend (layout) + Product (copy)
 *
 * JOB OF THIS PAGE: in 5 seconds, explain what Carry does and get the
 * organizer to tap "Start a project".
 *
 * This is a Server Component (no "use client" at the top) because it has no
 * interactivity. It renders instantly as static HTML. Keep it that way.
 *
 * TODO (Frontend + Product):
 *   [ ] Headline + one-sentence pitch ("Stop carrying your group project.")
 *   [ ] Primary button → /new  ("Start a project")
 *   [ ] Secondary button → /p/demo42  ("See a demo group"), handy during judging
 *   [ ] A 4-step "how it works": paste assignment → share link in the group
 *       chat → Carry does the chasing → contribution receipt
 *   [ ] Use next/link's <Link> for navigation (not <a>)
 */

import Link from "next/link";

export default function Home() {
  return (
    <main className="pt-14">
      <p className="text-sm font-semibold text-accent uppercase">Carry</p>
      <h1 className="mt-2 text-3xl font-bold">Stop carrying your group project.</h1>
      <p className="mt-4 text-muted">TODO: landing page. See the comment at the top of app/page.tsx.</p>

      {/* Temporary links so the team can click around the skeleton */}
      <nav className="mt-8 flex flex-col gap-2 text-sm underline">
        <Link href="/new">/new: create project</Link>
        <Link href="/p/demo42">/p/demo42: dashboard</Link>
        <Link href="/p/demo42/join">/p/demo42/join</Link>
        <Link href="/p/demo42/plan">/p/demo42/plan</Link>
        <Link href="/p/demo42/share">/p/demo42/share</Link>
        <Link href="/p/demo42/receipt">/p/demo42/receipt</Link>
      </nav>
    </main>
  );
}
