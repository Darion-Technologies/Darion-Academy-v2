import { submitQuizAction } from "@/app/actions/learning";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("EMPLOYEE", "INTERN"); const { id } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: { orderBy: { order: "asc" } }, lesson: { include: { module: true } }, attempts: { where: { userId: user.id } } } });
  if (!quiz || !await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: quiz.lesson.module.courseId } } })) notFound();
  return <><div className="mb-6"><h1 className="text-2xl font-bold">{quiz.title}</h1><p className="mt-1 text-sm text-slate-500">Pass mark: {quiz.passMark}% · Attempts: {quiz.attempts.length}{quiz.maxAttempts ? `/${quiz.maxAttempts}` : ""}</p></div><form action={submitQuizAction} className="space-y-5"><input type="hidden" name="quizId" value={quiz.id} />{quiz.questions.map((question, index) => <Card key={question.id}><CardHeader><CardTitle className="text-base">{index + 1}. {question.prompt} <span className="text-xs font-normal text-slate-500">({question.points} points)</span></CardTitle></CardHeader><CardContent>{question.type === "MULTIPLE_CHOICE" ? <div className="space-y-2">{(question.options as string[]).map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 rounded-none border p-3 text-sm hover:bg-slate-50"><input type="radio" name={`question-${question.id}`} value={option} required />{option}</label>)}</div> : question.type === "TRUE_FALSE" ? <div className="flex gap-3">{["True","False"].map((v)=><label key={v} className="flex flex-1 gap-2 rounded-none border p-3"><input type="radio" name={`question-${question.id}`} value={v} required />{v}</label>)}</div> : <div><Label>Answer</Label><Input name={`question-${question.id}`} required /></div>}</CardContent></Card>)}<SubmitButton size="lg" pendingText="Scoring quiz...">Submit quiz</SubmitButton></form></>;
}
