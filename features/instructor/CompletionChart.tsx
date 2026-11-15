"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CompletionStat } from "@/types";

/** Course titles are long; a short label keeps the axis readable on a phone. */
function shortTitle(title: string): string {
  const head = title.split(":")[0];
  return head.length > 22 ? `${head.slice(0, 21)}…` : head;
}

export function CompletionChart({ stats }: { stats: CompletionStat[] }) {
  const data = stats.map((s) => ({ name: shortTitle(s.title), Started: s.enrolled, Completed: s.completed }));
  return (
    <div
      role="img"
      aria-label={`Bar chart of students who started and completed each course. ${stats
        .map((s) => `${s.title}: ${s.enrolled} started, ${s.completed} completed`)
        .join(". ")}`}
      className="h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" />
          <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" />
          <Tooltip
            cursor={{ fill: "var(--surface-muted)" }}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
          />
          <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 13 }} />
          <Bar dataKey="Started" fill="var(--muted)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="Completed" fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
