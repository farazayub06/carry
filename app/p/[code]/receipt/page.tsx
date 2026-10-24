import { Suspense } from "react";
import { ReceiptScreen } from "@/components/ReceiptScreen";

export default function ReceiptPage() {
  return (
    <Suspense fallback={<p className="pt-6 text-muted">Loading…</p>}>
      <ReceiptScreen />
    </Suspense>
  );
}