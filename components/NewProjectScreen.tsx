"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateProjectInput } from "@/lib/types";
import { PdfUpload } from "@/components/PdfUpload";

const MAX_MEMBERS = 6;

const inputClass =
  "w-full rounded-xl border border-border bg-card px-3 py-3 text-base placeholder:text-muted";

export function NewProjectScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignment, setAssignment] = useState("");
  const [rubric, setRubric] = useState("");
  const [memberNames, setMemberNames] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teammate list helpers: always build a NEW array, never edit the old one
  function setMemberName(index: number, value: string) {
    setMemberNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }
  function addMember() {
    if (memberNames.length < MAX_MEMBERS) setMemberNames((prev) => [...prev, ""]);
  }
  function removeMember(index: number) {
    if (memberNames.length > 2) {
      setMemberNames((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit() {
    setError(null);

    const cleanNames = memberNames.map((n) => n.trim()).filter(Boolean);

    if (!name.trim()) return setError("Give your project a name.");
    if (!dueDate) return setError("Pick the real due date.");
    // End of the due day, in the user's timezone
    const due = new Date(`${dueDate}T23:59:00`);
    if (due.getTime() <= Date.now()) return setError("The due date has to be in the future.");
    if (cleanNames.length < 2) return setError("Add at least 2 teammates (including you).");
    if (!assignment.trim()) return setError("Paste the assignment so the AI can build a plan.");

    const body: CreateProjectInput = {
      name: name.trim(),
      assignment_text: assignment.trim(),
      rubric_text: rubric.trim(),
      due_at: due.toISOString(),
      member_names: cleanNames, // first name = the organizer
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();

      const shareCode = data.share_code ?? data.project?.share_code;
      if (!shareCode) throw new Error("no share code");

      // The first member is the organizer; remember them so they skip the join screen
      const organizerId = data.member_id ?? data.members?.[0]?.id;
      if (organizerId) localStorage.setItem(`carry:me:${shareCode}`, organizerId);

      router.push(`/p/${shareCode}/plan`);
    } catch {
      setError("Something went wrong creating your project. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pt-2 pb-8">
      <div>
        <h1 className="text-2xl font-bold">New project</h1>
        <p className="mt-1 text-sm text-muted">
          Tell Carry about the assignment and it will build a fair plan for your group.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm text-muted">Project name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="PSYCH 2220 group presentation"
          className={inputClass}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-muted">Real due date</span>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm text-muted">Your group</span>
        {memberNames.map((memberName, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={memberName}
              onChange={(e) => setMemberName(index, e.target.value)}
              placeholder={index === 0 ? "Your name" : "Teammate's name"}
              className={inputClass}
            />
            {index >= 2 && (
              <button
                onClick={() => removeMember(index)}
                aria-label="Remove teammate"
                className="px-3 text-2xl text-muted"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {memberNames.length < MAX_MEMBERS && (
          <button onClick={addMember} className="text-sm font-medium text-brand">
            + Add teammate
          </button>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="assignment" className="shrink-0 text-sm text-muted">Assignment</label>
          <PdfUpload onText={setAssignment} />
        </div>
        <textarea
          id="assignment"
          value={assignment}
          onChange={(e) => setAssignment(e.target.value)}
          rows={6}
          placeholder="Paste the assignment prompt or upload the PDF"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="rubric" className="shrink-0 text-sm text-muted">Rubric (optional)</label>
          <PdfUpload onText={setRubric} />
        </div>
        <textarea
          id="rubric"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          rows={4}
          placeholder="Paste the grading rubric (one criterion per line) or upload the PDF"
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="min-h-12 w-full rounded-xl bg-brand font-medium text-brand-foreground disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Build my plan"}
      </button>
    </div>
  );
}