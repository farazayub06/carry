/**
 * components/ReceiptCard.tsx — one person's line on the contribution receipt
 * ---------------------------------------------------------------------------
 * OWNER: Frontend + Product/Design (part of the MONEY SHOT of the demo video)
 *
 * SHOW, for one ReceiptRow (lib/types.ts):
 *   - avatar + name (🏆 next to the top contributor when rank === 0)
 *   - BIG number: effort_share_pct  → "who carried the team"
 *   - small line: tasks_done · on_time_rate_pct% on time · confirmations confirmed · open_tasks open
 *   - a thin bar whose width = effort_share_pct, in the member's color
 *   - dashed divider between people (receipt look)
 *
 * TODO (Frontend + Product):
 *   [ ] Build it; make it look great in a phone screenshot
 */

import type { ReceiptRow } from "@/lib/types";

export function ReceiptCard({ row, rank }: { row: ReceiptRow; rank: number }) {
  // TODO: real card. Placeholder:
  return (
    <div className="border-b border-dashed border-line py-3 text-sm">
      #{rank + 1} {row.name}: {row.effort_share_pct}%
    </div>
  );
}
