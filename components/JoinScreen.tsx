"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ProjectState } from "@/lib/types";

export function JoinScreen() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [state, setState] = useState<ProjectState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Load the real project, and check whether this phone already picked a name
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/p/${code}`, { cache: "no-store" });
        if (!res.ok) throw new Error("not found");
        const data: ProjectState = await res.json();
        if (cancelled) return;
        setState(data);
        setSavedId(localStorage.getItem(`carry:me:${code}`));
      } catch {
        if (!cancelled) setNotFound(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!state && !notFound) {
    return <p className="pt-6 text-muted">Loading…</p>;
  }

  if (notFound || !state) {
    return (
      <div className="space-y-2 pt-6">
        <h1 className="text-2xl font-bold">Hmm, we can&apos;t find that project</h1>
        <p className="text-sm text-muted">
          Double-check the link your teammate sent you.
        </p>
      </div>
    );
  }

  function pick(memberId: string) {
    localStorage.setItem(`carry:me:${code}`, memberId);
    router.push(`/p/${code}`);
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h1 className="text-2xl font-bold">Which one are you?</h1>
        <p className="mt-1 text-sm text-muted">{state.project.name}</p>
      </div>

      <ul className="space-y-3">
        {state.members.map((member) => {
          const isMe = member.id === savedId;
          return (
            <li key={member.id}>
              <button
                onClick={() => pick(member.id)}
                className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left text-lg font-medium ${
                  isMe ? "border-brand bg-brand/10" : "border-border bg-card"
                }`}
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-full"
                  style={{ backgroundColor: member.color }}
                />
                {member.name}
                {isMe && <span className="ml-auto text-sm text-brand">That&apos;s you</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}