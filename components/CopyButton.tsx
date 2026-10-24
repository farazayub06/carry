"use client";
/**
 * components/CopyButton.tsx — copy text to the clipboard + confirm it
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 *
 * The bridge to Snapchat / iMessage: we can't post into those chats, so we
 * make copy + paste effortless instead. Used on the share screen (intro
 * message, link), the dashboard ("📣 Copy update") and the receipt.
 *
 * TWO WAYS TO USE IT:
 *   <CopyButton text={link}>Copy link</CopyButton>
 *   <CopyButton getText={async () => (await fetchUpdate()).message}>Copy update</CopyButton>
 *     ↑ getText lets the text be generated ON CLICK (e.g. the AI-written update)
 *
 * HOW: await navigator.clipboard.writeText(value)
 *   - show "Writing…" while getText runs
 *   - then a short confirmation ("Copied! Paste it in the group chat")
 *   - the clipboard API can fail (e.g. a phone on plain http, not https):
 *     catch it and tell the user instead of failing silently
 *
 * TODO (Frontend):
 *   [ ] Implement copy() as described, with busy + success/error feedback
 */

import type { ReactNode } from "react";

export function CopyButton({
  text,
  getText,
  children,
}: {
  text?: string;
  getText?: () => Promise<string>;
  children: ReactNode;
}) {
  async function copy() {
    // TODO: implement (see the comment above). Placeholder:
    const value = getText ? await getText() : (text ?? "");
    console.log("TODO copy to clipboard:", value);
  }

  return (
    <button onClick={copy} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold">
      {children}
    </button>
  );
}
