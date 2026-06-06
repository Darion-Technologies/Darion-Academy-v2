import { Award, BookOpen, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LearnerDashboard() {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const [enrollments, pending, attempts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { learnerId: user.id },
      include: { course: true, certificates: { where: { status: "GENERATED" }, select: { id: true } } },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.submission.count({ where: { learnerId: user.id, status: { in: ["PENDING", "SUBMITTED", "NEEDS_CORRECTION"] } } }),
    prisma.quizAttempt.findMany({ where: { userId: user.id, submittedAt: { not: null } }, orderBy: { submittedAt: "desc" }, take: 5, include: { quiz: true } }),
  ]);
  return <>
    <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description="Continue learning and keep your development moving." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Assigned courses" value={enrollments.length} icon={BookOpen} />
      <StatCard label="Average progress" value={`${enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length) : 0}%`} icon={CheckCircle2} />
      <StatCard label="Pending tasks" value={pending} icon={Clock} />
      <StatCard label="Certificates" value={enrollments.filter((e) => e.certificates.length > 0).length} icon={Award} />
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <Card><CardHeader><CardTitle>Continue learning</CardTitle></CardHeader><CardContent className="space-y-4">
        {!enrollments.length ? <EmptyState title="No courses assigned" description="Your assigned courses will appear here." /> : enrollments.slice(0, 4).map(({ course, progressPercent, status }) => (
          <div key={course.id} className="rounded-none border p-4"><div className="flex items-start justify-between gap-3"><div><Badge>{course.category}</Badge><h3 className="mt-2 font-semibold">{course.title}</h3></div><span className="text-sm font-semibold">{progressPercent}%</span></div><Progress value={progressPercent} className="my-3" /><div className="flex items-center justify-between text-xs text-slate-500"><span>{status.replaceAll("_", " ")}</span><Button size="sm" asChild><Link href={`/courses/${course.slug}`}>Continue</Link></Button></div></div>
        ))}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Recent quiz results</CardTitle></CardHeader><CardContent className="space-y-3">
        {!attempts.length ? <p className="text-sm text-slate-500">No quiz attempts yet.</p> : attempts.map((attempt) => <div key={attempt.id} className="flex items-center justify-between border-b pb-3 last:border-0"><div><p className="text-sm font-medium">{attempt.quiz.title}</p><p className="text-xs text-slate-500">{attempt.status}</p></div><Badge className={attempt.status === "PASSED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>{attempt.score}%</Badge></div>)}
      </CardContent></Card>
    </div>
  </>;
}
