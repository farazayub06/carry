"use client";

import { useRef, useState } from "react";

/** "Upload PDF" link that extracts the PDF's text on the server and hands it back. */
export function PdfUpload({ onText }: { onText: (text: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "done" | "error"; message?: string }>({
    kind: "idle",
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setStatus({ kind: "busy" });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't read that PDF.");
      onText(data.text);
      setStatus({ kind: "done", message: `Loaded ${file.name}` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Couldn't read that PDF." });
    } finally {
      if (inputRef.current) inputRef.current.value = ""; // allow picking the same file again
    }
  }

  return (
    <span className="flex items-center justify-end gap-2 text-right text-sm">
      {status.kind === "done" && <span className="text-done">{status.message}</span>}
      {status.kind === "error" && <span className="text-danger">{status.message}</span>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status.kind === "busy"}
        className="shrink-0 font-medium text-brand-foreground underline disabled:opacity-60"
      >
        {status.kind === "busy" ? "Reading…" : "Upload PDF"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </span>
  );
}
