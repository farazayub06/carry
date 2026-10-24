"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildDemoState } from "@/lib/mock";

export function DashboardScreen() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [state] = useState(buildDemoState); // temporary, replaced by a real fetch later

  const [meId, setMeId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`carry:me:${code}`);
    if (saved) {
      setMeId(saved);
      setChecked(true);
    } else {
      router.replace(`/p/${code}/join`);
    }
  }, [code, router]);

  // Don't show anything until we know who this is
  if (!checked) {
    return <p className="pt-6 text-muted">Loading…</p>;
  }

  const me = state.members.find((m) => m.id === meId);

  function switchPerson() {
    localStorage.removeItem(`carry:me:${code}`);
    router.replace(`/p/${code}/join`);
  }

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-2xl font-bold">{state.project.name}</h1>
      <p className="text-sm text-muted">
        You&apos;re {me ? me.name : "unknown"} ·{" "}
        <button onClick={switchPerson} className="underline">
          switch
        </button>
      </p>

      <ul className="space-y-2">
        {state.tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}