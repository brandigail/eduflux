import { Award, Users } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { CompletionChart } from "@/features/instructor/CompletionChart";
import { getInstructorOverview } from "@/lib/queries/instructor";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Instructor dashboard" };

export default async function InstructorPage() {
  const user = await requireUser("/instructor");
  if (user.role !== "INSTRUCTOR") redirect("/");
  const { stats, totalStudents, totalCertificates } = await getInstructorOverview();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold">Instructor dashboard</h1>
        <p className="mt-1 text-muted">Completion across your courses.</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <dt className="flex items-center gap-2 text-sm text-muted">
              <Users className="h-4 w-4" aria-hidden /> Students
            </dt>
            <dd className="mt-1 text-3xl font-bold">{totalStudents}</dd>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <dt className="flex items-center gap-2 text-sm text-muted">
              <Award className="h-4 w-4" aria-hidden /> Certificates issued
            </dt>
            <dd className="mt-1 text-3xl font-bold">{totalCertificates}</dd>
          </div>
        </dl>

        <section aria-labelledby="chart" className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <h2 id="chart" className="font-semibold">
            Started vs completed
          </h2>
          <div className="mt-4">
            <CompletionChart stats={stats} />
          </div>
        </section>

        <section aria-labelledby="table" className="mt-8">
          <h2 id="table" className="font-semibold">
            Course breakdown
          </h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th scope="col" className="p-3 font-medium">
                    Course
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Started
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Completed
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Completion
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Avg best score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.map((s) => (
                  <tr key={s.courseId}>
                    <th scope="row" className="p-3 font-medium">
                      {s.title}
                    </th>
                    <td className="p-3 tabular-nums">{s.enrolled}</td>
                    <td className="p-3 tabular-nums">{s.completed}</td>
                    <td className="p-3 tabular-nums">
                      {s.enrolled === 0 ? "n/a" : `${Math.round((s.completed / s.enrolled) * 100)}%`}
                    </td>
                    <td className="p-3 tabular-nums">{s.averageScore === null ? "n/a" : `${s.averageScore}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
