import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProgressPage() {
  const user = await requireUser();
  const enrollments = await prisma.enrollment.findMany({ where: { learnerId: user.id }, include: { course: { include: { modules: { include: { lessons: true } } } } } });
  return <><PageHeader title="Learning progress" description="A complete view of your course completion." /><div className="space-y-5">{enrollments.map((e)=><Card key={e.id}><CardHeader><div className="flex justify-between"><CardTitle>{e.course.title}</CardTitle><Badge>{e.status.replaceAll("_"," ")}</Badge></div></CardHeader><CardContent><div className="mb-2 flex justify-between text-sm"><span>{e.course.modules.flatMap((m)=>m.lessons).length} lessons</span><b>{e.progressPercent}%</b></div><Progress value={e.progressPercent} /><p className="mt-4 text-xs text-slate-500">{e.status === "AWAITING_APPROVAL" ? "All requirements complete. Awaiting mentor approval." : e.status === "COMPLETED" ? "Course completed and approved." : "Complete required lessons, assignments, and quizzes to become eligible."}</p></CardContent></Card>)}</div></>;
}
