import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function QuizResultPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ attempt?: string }> }) {
  const user = await requireRole("EMPLOYEE", "INTERN"); const { id } = await params; const { attempt: attemptId } = await searchParams;
  const attempt = attemptId ? await prisma.quizAttempt.findFirst({ where: { id: attemptId, quizId: id, userId: user.id }, include: { quiz: { include: { lesson: { include: { module: { include: { course: true } } } } } }, answers: true } }) : null;
  if (!attempt) notFound();
  return <div className="mx-auto max-w-xl pt-10"><Card><CardContent className="p-8 text-center"><Badge className={attempt.status === "PASSED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>{attempt.status}</Badge><p className="mt-6 text-6xl font-bold text-slate-950">{attempt.score}%</p><p className="mt-2 text-slate-500">{attempt.earnedPoints} of {attempt.totalPoints} points · {attempt.answers.filter((a)=>a.isCorrect).length} correct</p><h1 className="mt-6 text-xl font-semibold">{attempt.quiz.title}</h1><div className="mt-7 flex justify-center gap-3"><Button variant="outline" asChild><Link href={`/courses/${attempt.quiz.lesson.module.course.slug}`}>Back to course</Link></Button>{attempt.status === "FAILED" && <Button asChild><Link href={`/quizzes/${attempt.quizId}`}>Try again</Link></Button>}</div></CardContent></Card></div>;
}
