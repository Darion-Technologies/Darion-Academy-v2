import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";

export default async function CoursesPage() {
  const user = await requireUser();
  const enrollments = await prisma.enrollment.findMany({ where: user.role === "ADMIN" ? {} : user.role === "MENTOR" ? { mentorId: user.id } : { learnerId: user.id }, include: { course: true }, orderBy: { assignedAt: "desc" } });
  return <><PageHeader title="Courses" description="Your assigned learning catalog." />{!enrollments.length ? <EmptyState title="No courses found" description="Assigned courses will appear here." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{enrollments.map(({ course, progressPercent, status }) => <Card key={`${course.id}-${status}`} className="overflow-hidden"><div className="h-28 bg-[#143c72] p-5 text-white"><Badge className="bg-white/15 text-white">{course.category}</Badge><h2 className="mt-3 text-lg font-bold">{course.title}</h2></div><CardContent className="pt-5"><p className="line-clamp-2 min-h-10 text-sm text-slate-500">{course.description}</p><div className="my-4 flex justify-between text-xs text-slate-500"><span>{course.difficulty}</span><span>{formatDuration(course.estimatedMinutes)}</span></div><div className="mb-1 flex justify-between text-xs"><span>Progress</span><span>{progressPercent}%</span></div><Progress value={progressPercent} /><Button className="mt-5 w-full" asChild><Link href={`/courses/${course.slug}`}>Open course</Link></Button></CardContent></Card>)}</div>}</>;
}
