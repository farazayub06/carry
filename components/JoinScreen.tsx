"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildDemoState } from "@/lib/mock";

export function JoinScreen() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [state] = useState(buildDemoState); // temporary, replaced by a real fetch later
  const [savedId, setSavedId] = useState<string | null>(null);

  // Check whether this phone already picked a name before
  useEffect(() => {
    setSavedId(localStorage.getItem(`carry:me:${code}`));
  }, [code]);

  // Temporary "not found" check: with mock data, only the demo code exists
  if (code !== state.project.share_code) {
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