import { Suspense } from "react";
import { ShareScreen } from "@/components/ShareScreen";

export default function SharePage() {
  return (
    <Suspense fallback={<p className="pt-6 text-muted">Loading…</p>}>
      <ShareScreen />
    </Suspense>
  );
}