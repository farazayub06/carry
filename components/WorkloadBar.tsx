import type { Member, Task } from "@/lib/types";
import { computeWorkload } from "@/lib/utils";

export function WorkloadBar({ members, tasks }: { members: Member[]; tasks: Task[] }) {
  const { perMember, unclaimedEffort, totalEffort } = computeWorkload(members, tasks);

  if (totalEffort === 0) return null; // nothing to show yet

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        Workload split
      </h2>

      {/* The bar: one segment per person, plus gray for unclaimed */}
      <div className="flex h-4 overflow-hidden rounded-full bg-border">
        {perMember.map(({ member, effort }) => (
          <div
            key={member.id}
            style={{
              width: `${(effort / totalEffort) * 100}%`,
              backgroundColor: member.color,
            }}
          />
        ))}
        <div
          className="bg-todo/40"
          style={{ width: `${(unclaimedEffort / totalEffort) * 100}%` }}
        />
      </div>

      {/* The legend: who has how many points */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {perMember.map(({ member, effort }) => (
          <li key={member.id} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: member.color }}
            />
            {member.name} <span className="text-muted">{effort} pts</span>
          </li>
        ))}
        {unclaimedEffort > 0 && (
          <li className="flex items-center gap-1.5 text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-todo/40" />
            Unclaimed {unclaimedEffort} pts
          </li>
        )}
      </ul>
    </section>
  );
}