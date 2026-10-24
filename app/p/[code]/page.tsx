import { Suspense } from "react";
import { DashboardScreen } from "@/components/DashboardScreen";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="pt-6 text-muted">Loading…</p>}>
      <DashboardScreen />
    </Suspense>
  );
} 