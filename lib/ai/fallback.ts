/**
 * lib/ai/fallback.ts — rule-based answers for when the AI is off or fails
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * Every AI feature has a "simple but reliable" twin here. Used when:
 *   - there's no API key yet (everyone's laptop on day one)
 *   - the API times out or returns broken JSON twice
 *   - the venue Wi-Fi dies during judging
 *
 * Keep them predictable. Tag every result source: "fallback" so the UI can
 * say "AI unavailable, so here's a starter plan".
 *
 * TODO (AI): implement all four. Ideas below each one.
 *   [x] fallbackPlan
 *   [x] fallbackStuck
 *   [x] fallbackUpdate
 *   [x] fallbackRubricCheck
 */

import type { DraftTask, Member, PlanResult, ProjectState, RubricCheckResult, StuckResult, Task } from "../types";
import { daysUntil, lightestMember, relativeDay } from "../utils";

const DAY_MS = 86_400_000;

type TaskIdea = Omit<DraftTask, "internal_due_at">;

/** Middle-of-the-plan tasks per assignment type. First matching keyword list wins. */
const PLAN_TEMPLATES: { keywords: RegExp; tasks: TaskIdea[] }[] = [
  {
    keywords: /slide|presentation|present|deck|pitch|talk|poster/i,
    tasks: [
      { title: "Research and gather content", description: "Key facts, sources and examples collected in a shared doc.", effort: 3 },
      { title: "Outline the presentation", description: "A slide-by-slide outline everyone agrees on.", effort: 2 },
      { title: "Build the slide deck", description: "Every slide drafted with visuals in the shared deck.", effort: 4 },
      { title: "Rehearse the presentation", description: "One full timed run-through with every speaker.", effort: 2 },
    ],
  },
  {
    keywords: /\bcode\b|coding|\bapp\b|program|software|website|prototype|github|api/i,
    tasks: [
      { title: "Set up the repo and tools", description: "A shared repo everyone can clone and run.", effort: 2 },
      { title: "Build the core features", description: "The main features from the prompt work end to end.", effort: 5 },
      { title: "Test and fix bugs", description: "Every required feature tested; known bugs fixed or noted.", effort: 3 },
      { title: "Write the README and demo notes", description: "Setup steps and a short demo script anyone can follow.", effort: 2 },
    ],
  },
  {
    keywords: /survey|data|dataset|experiment|statistic|analy[sz]|interview|questionnaire/i,
    tasks: [
      { title: "Design the survey or method", description: "Questions or procedure written and checked against the prompt.", effort: 3 },
      { title: "Collect the data", description: "Enough responses or measurements to analyze.", effort: 4 },
      { title: "Analyze the results", description: "Key findings with at least one chart or table.", effort: 4 },
      { title: "Write up the findings", description: "Methods, results and discussion drafted.", effort: 3 },
    ],
  },
  {
    keywords: /essay|paper|report|write-?up|literature|review|proposal/i,
    tasks: [
      { title: "Research sources", description: "A list of credible sources with notes on each.", effort: 3 },
      { title: "Outline the paper", description: "Thesis and section-by-section outline agreed on.", effort: 2 },
      { title: "Draft the sections", description: "A complete first draft of every section.", effort: 5 },
      { title: "Edit and format citations", description: "One consistent voice, citations in the required style.", effort: 2 },
    ],
  },
];

const GENERIC_TASKS: TaskIdea[] = [
  { title: "Research the topic", description: "Notes and sources collected in a shared doc.", effort: 3 },
  { title: "Draft the main deliverable", description: "A complete first version of what we hand in.", effort: 5 },
  { title: "Polish and assemble", description: "All parts combined into one consistent final version.", effort: 3 },
];

/** Split a pasted rubric into checklist items, dropping bullets and numbering. */
function rubricLines(rubric: string): string[] {
  return rubric
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•▪◦]|\d+[.)]|[a-z][.)])\s*/i, "").trim())
    .filter((line) => line.length > 2)
    .slice(0, 12);
}

/**
 * A generic plan. IDEAS:
 *   - detect the assignment type from keywords (slides/presentation, code/app,
 *     survey/data) and add matching tasks
 *   - always start with "Break down the prompt and rubric", end with
 *     "Final review against the rubric"
 *   - spread internal deadlines evenly from now to (due date − 2 days)
 *   - rubric_items = the rubric split by line
 */
export function fallbackPlan(assignment: string, rubric: string, dueAt: string): PlanResult {
  const middle = PLAN_TEMPLATES.find((t) => t.keywords.test(assignment))?.tasks ?? GENERIC_TASKS;
  const ideas: TaskIdea[] = [
    { title: "Break down the prompt and rubric", description: "A shared list of every requirement and how it's graded.", effort: 1 },
    ...middle,
    { title: "Final review against the rubric", description: "Every rubric item checked off before we submit.", effort: 2 },
  ];

  // Evenly spaced from now to 2 days before the real due date (never in the past).
  const now = Date.now();
  const due = Date.parse(dueAt);
  const last = Math.max(now, (Number.isNaN(due) ? now + 7 * DAY_MS : due) - 2 * DAY_MS);
  const tasks = ideas.map((idea, i) => ({
    ...idea,
    internal_due_at: new Date(now + ((last - now) * (i + 1)) / ideas.length).toISOString(),
  }));

  return { tasks, rubric_items: rubricLines(rubric), source: "fallback" };
}

/**
 * Generic unblocking steps + suggest the lightest-loaded teammate
 * (lightestMember() in lib/utils.ts, excluding the task owner).
 */
export function fallbackStuck(task: Task, members: Member[], tasks: Task[]): StuckResult {
  const substeps = [
    `Re-read what "done" means: ${task.description || task.title}`,
    "Write down exactly what's blocking you (a question, a missing file, a decision).",
    "Pick the smallest next action you can finish in 15 minutes, and do just that.",
    "Post the blocker in the group chat and tag whoever knows that part best.",
    "Still too big? Split it into two smaller tasks in the plan.",
  ];

  const helper = lightestMember(members, tasks, task.owner_id ?? undefined);
  return {
    substeps,
    suggest_reassign_to: helper?.id ?? null,
    reason: helper
      ? `${helper.name} has the lightest load right now, so they could pair with you or take part of "${task.title}".`
      : "Nobody else is free right now, so try the steps above first and ask the group if you're still stuck.",
    source: "fallback",
  };
}

/**
 * A short group-chat update built from a template, e.g.
 *   "📋 PSYCH 2220: 3/9 tasks done, due in 12 days.
 *    • Jordan: Lit review slides (in 3 days)
 *    • Priya: Analyze survey results (in 5 days)
 *    🙋 3 tasks still up for grabs"
 */
export function fallbackUpdate(state: ProjectState): string {
  const { project, members, tasks } = state;
  const done = tasks.filter((t) => t.status === "done").length;
  const dueIn = daysUntil(project.due_at) < 0 ? `was due ${relativeDay(project.due_at)}` : `due ${relativeDay(project.due_at)}`;
  const lines = [`📋 ${project.name}: ${done}/${tasks.length} tasks done, ${dueIn}.`];

  const nameOf = new Map(members.map((m) => [m.id, m.name]));
  const active = tasks
    .filter((t) => t.owner_id && t.status !== "done")
    .sort((a, b) => a.internal_due_at.localeCompare(b.internal_due_at))
    .slice(0, 5);
  for (const t of active) {
    const flag = t.status === "stuck" ? " ⚠️ stuck" : "";
    lines.push(`• ${nameOf.get(t.owner_id!) ?? "Someone"}: ${t.title} (${relativeDay(t.internal_due_at)})${flag}`);
  }

  const open = tasks.filter((t) => !t.owner_id && t.status !== "done").length;
  if (open > 0) lines.push(`🙋 ${open} task${open === 1 ? "" : "s"} still up for grabs`);
  else if (tasks.length > 0 && done === tasks.length) lines.push("🎉 Everything's done!");

  return lines.join("\n");
}

/** Words too generic to prove a rubric item is covered. */
const STOPWORDS = new Set(
  "the and for are with that this from your their each should will must have has use using include includes including least points point clear clearly well good all any into about more than per".split(" "),
);

/** Lowercase keywords (3+ letters, no stopwords, trailing plural "s" dropped). */
function keywords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]{3,}/g) ?? [])
    .filter((w) => !STOPWORDS.has(w))
    .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));
}

/** Naive check: a rubric item counts as "covered" if a task title/description shares a keyword with it. */
export function fallbackRubricCheck(rubricItems: string[], tasks: Task[]): RubricCheckResult {
  const planWords = new Set(tasks.flatMap((t) => keywords(`${t.title} ${t.description}`)));
  const covered: string[] = [];
  const missing: string[] = [];
  for (const item of rubricItems) {
    (keywords(item).some((w) => planWords.has(w)) ? covered : missing).push(item);
  }
  return { covered, missing, source: "fallback" };
}
