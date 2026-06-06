import { CheckCircle2, Circle, Clock, Lock } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser(); const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } } });
  if (!course) notFound();
  const enrollment = await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: course.id } } });
  if (!enrollment && user.role !== "ADMIN" && !(user.role === "MENTOR" && await prisma.enrollment.findFirst({ where: { courseId: course.id, mentorId: user.id } }))) notFound();
  const completed = user.role === "EMPLOYEE" || user.role === "INTERN" ? await prisma.progress.findMany({ where: { userId: user.id, completed: true, lesson: { module: { courseId: course.id } } }, select: { lessonId: true } }) : [];
  const done = new Set(completed.map((p) => p.lessonId));
  return <><PageHeader title={course.title} description={course.description} /><div className="mb-6 grid gap-4 sm:grid-cols-3"><Card><CardContent className="pt-5"><p className="text-xs text-slate-500">Difficulty</p><p className="mt-1 font-semibold">{course.difficulty}</p></CardContent></Card><Card><CardContent className="pt-5"><p className="text-xs text-slate-500">Duration</p><p className="mt-1 font-semibold">{formatDuration(course.estimatedMinutes)}</p></CardContent></Card><Card><CardContent className="pt-5"><div className="flex justify-between text-xs"><span>Overall progress</span><span>{enrollment?.progressPercent ?? 0}%</span></div><Progress value={enrollment?.progressPercent ?? 0} className="mt-3" /></CardContent></Card></div><div className="space-y-5">{course.modules.map((module) => <Card key={module.id}><CardHeader><CardTitle>Module {module.order}: {module.title}</CardTitle>{module.description && <p className="text-sm text-slate-500">{module.description}</p>}</CardHeader><CardContent className="space-y-2">{module.lessons.map((lesson) => <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="flex items-center gap-3 rounded-none border p-3 hover:border-blue-300 hover:bg-blue-50/30">{done.has(lesson.id) ? <CheckCircle2 className="size-5 text-emerald-600" /> : <Circle className="size-5 text-slate-300" />}<div className="flex-1"><p className="text-sm font-medium">{lesson.order}. {lesson.title}</p><div className="mt-1 flex gap-3 text-xs text-slate-500"><Badge>{lesson.type}</Badge><span className="flex items-center gap-1"><Clock className="size-3" />{lesson.estimatedMinutes} min</span></div></div>{lesson.completionRequired && <Lock className="size-3 text-slate-400" />}</Link>)}</CardContent></Card>)}</div></>;
}
