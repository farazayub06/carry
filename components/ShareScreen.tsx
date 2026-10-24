"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ProjectState } from "@/lib/types";

export function ShareScreen() {
  const { code } = useParams<{ code: string }>();
  const [projectName, setProjectName] = useState("our group project");
  const [origin, setOrigin] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // window doesn't exist on the server, so read it after the page loads.
  // Also load the real project name for the invite message.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const here = window.location.origin;
      try {
        const res = await fetch(`/api/p/${code}`, { cache: "no-store" });
        if (res.ok) {
          const data: ProjectState = await res.json();
          if (!cancelled) setProjectName(data.project.name);
        }
      } catch {
        // keep the generic name
      }
      if (!cancelled) setOrigin(here);
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const link = `${origin}/p/${code}`;
  const intro = `Hey! I set up "${projectName}" on Carry so we can split the work fairly. Tap to pick your name and claim tasks: ${link}`;

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(message);
    } catch {
      setToast("Couldn't copy. Try again.");
    }
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold">Invite your group</h1>
        <p className="mt-1 text-sm text-muted">
          Paste the message into your group chat. Everyone joins by tapping the link.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 text-sm break-all">
        {link}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => copy(link, "Link copied!")}
          className="min-h-12 rounded-xl border border-border bg-card px-3 font-medium"
        >
          Copy link
        </button>
        <button
          onClick={() => copy(intro, "Message copied! Paste it in your group chat.")}
          className="min-h-12 rounded-xl bg-brand px-3 font-medium text-brand-foreground"
        >
          Copy message
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted">Preview</p>
        <p className="rounded-xl border border-border bg-card p-3 text-sm">{intro}</p>
      </div>

      <Link
        href={`/p/${code}`}
        className="flex min-h-12 items-center justify-center rounded-xl bg-brand font-medium text-brand-foreground"
      >
        Go to dashboard
      </Link>

      {toast && (
        <div className="fixed inset-x-4 bottom-6 mx-auto max-w-md rounded-xl bg-foreground px-4 py-3 text-center text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}