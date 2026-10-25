import Link from "next/link";

const STEPS = [
  { title: "Paste the assignment", body: "Carry's AI turns the prompt and rubric into a fair plan with effort points and early deadlines." },
  { title: "Share one link", body: "Drop it in your Snapchat or iMessage group chat. Everyone taps their name to join." },
  { title: "Carry keeps it moving", body: "Claim tasks, update status, get unstuck, and copy a friendly progress update into the chat." },
  { title: "Get the receipt", body: "A contribution receipt built from the activity log shows who actually did the work." },
];

export default function Home() {
  return (
    <div className="space-y-10 pt-8 pb-8">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">Carry</p>
        <h1 className="text-4xl font-bold leading-tight">Stop carrying your group project.</h1>
        <p className="text-muted">
          A fair plan, a shared tracker that lives in your group chat, and proof of who did what.
        </p>
        <div className="grid gap-2 pt-2">
          <Link
            href="/new"
            className="flex min-h-12 items-center justify-center rounded-xl bg-brand font-medium text-brand-foreground"
          >
            Start a project
          </Link>
          <Link
            href="/p/demo42"
            className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-card font-medium"
          >
            See a demo group
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">How it works</h2>
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
