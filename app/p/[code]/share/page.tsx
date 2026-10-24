/**
 * app/p/[code]/share/page.tsx — INVITE THE GROUP  (route: /p/<code>/share)
 * ---------------------------------------------------------------------------
 * OWNER: Frontend (+ Product writes the intro message copy)
 * CORE FLOW STEP 3.
 *
 * WHY THIS SCREEN EXISTS:
 * Snapchat and iMessage don't allow bots in group chats, so we make joining
 * a one-tap copy + paste instead. This is how Carry "plugs into" the chat.
 *
 * WHAT TO SHOW:
 *   - A preview of the intro message, styled like a chat bubble, e.g.
 *       "Hey team 👋 I put our <project name> plan in Carry so nobody gets
 *        stuck doing everything. Tap the link, pick your name, grab a task:
 *        <link>"
 *   - "Copy intro message" (primary)  and  "Copy link only" (secondary)
 *   - The share code in big letters (for reading out loud)
 *   - "Go to the dashboard →"
 *
 * THE LINK: `${origin}/p/<code>/join`
 *   origin = process.env.NEXT_PUBLIC_APP_URL (set on Vercel) or window.location.origin
 *   Note: window only exists in the browser; read it in a client component.
 *
 * Uses the <Suspense> + "use client" screen pattern from app/p/[code]/page.tsx.
 *
 * TODO (Frontend):
 *   [ ] Create ShareScreen.tsx ("use client"), render it here inside <Suspense>
 *   [ ] Build the pieces above using components/CopyButton.tsx
 */

export default function SharePage() {
  return (
    <main className="pt-6">
      <h1 className="text-2xl font-bold">Invite your group</h1>
      <p className="mt-2 text-sm text-muted">TODO: share screen. See the comment at the top of app/p/[code]/share/page.tsx.</p>
    </main>
  );
}
