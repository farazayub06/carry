import { Suspense } from "react";
import { PlanScreen } from "@/components/PlanScreen";

export default function PlanPage() {
  return (
    <Suspense fallback={<p className="pt-6 text-muted">Loading…</p>}>
      <PlanScreen />
    </Suspense>
  );
}