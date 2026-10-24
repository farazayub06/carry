import { Suspense } from "react";
import { JoinScreen } from "@/components/JoinScreen";

export default function JoinPage() {
  return (
    <Suspense fallback={<p className="pt-6 text-muted">Loading…</p>}>
      <JoinScreen />
    </Suspense>
  );
}