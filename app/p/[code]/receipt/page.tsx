/**
 * app/p/[code]/receipt/page.tsx — CONTRIBUTION RECEIPT  (route: /p/<code>/receipt)
 * ---------------------------------------------------------------------------
 * OWNER: Frontend + Product/Design. THIS IS THE LAST SHOT OF THE DEMO VIDEO.
 * CORE FLOW STEP 10.
 *
 * WHAT IT IS: a fair, evidence-based summary of who actually did the work,
 * built from the task list + event log (not opinions). Students screenshot it
 * for peer evaluations.
 *
 * DATA:
 *   GET /api/p/<code>                  → project (for the id + name)
 *   GET /api/projects/<id>/receipt     → { project, rows: ReceiptRow[], generated_at }
 *   (The math is in lib/db/receipt.ts.)
 *
 * DESIGN IDEA: style it like a store receipt (dashed dividers, monospace
 * header). The metaphor lands instantly: this is proof.
 *   - Header: "CARRY", project name, date
 *   - One <ReceiptCard> per member, biggest contributor first (🏆)
 *   - Footer: "5/6 finished tasks confirmed by a teammate"
 *   - "Copy as text for peer evals" button (plain-text version of the receipt)
 *
 * Uses the <Suspense> + "use client" screen pattern from app/p/[code]/page.tsx.
 *
 * TODO (Frontend + Product):
 *   [ ] Create ReceiptScreen.tsx ("use client"), render it here inside <Suspense>
 *   [ ] Fetch the receipt and render it as described above
 *   [ ] Make it look great in a screenshot on a phone
 */

export default function ReceiptPage() {
  return (
    <main className="pt-6">
      <h1 className="text-2xl font-bold">Contribution receipt</h1>
      <p className="mt-2 text-sm text-muted">TODO: receipt. See the comment at the top of app/p/[code]/receipt/page.tsx.</p>
    </main>
  );
}
