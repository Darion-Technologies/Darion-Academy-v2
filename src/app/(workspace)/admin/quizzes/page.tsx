import { addQuestionAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminQuizzesPage() {
  await requireRole("ADMIN");
  const quizzes = await prisma.quiz.findMany({ include: { questions: { orderBy: { order: "asc" } }, lesson: { include: { module: { include: { course: true } } } } } });
  return <><PageHeader title="Quizzes" description="Add objective and exact-match questions to quiz lessons." /><div className="space-y-6">{quizzes.map((quiz)=><Card key={quiz.id}><CardHeader><CardTitle>{quiz.title}</CardTitle><p className="text-sm text-slate-500">{quiz.lesson.module.course.title} · Pass mark {quiz.passMark}%</p></CardHeader><CardContent><div className="mb-5 space-y-2">{quiz.questions.map((q)=><div key={q.id} className="rounded-none border p-3 text-sm"><b>{q.order}. {q.prompt}</b><p className="mt-1 text-xs text-slate-500">{q.type} · {q.points} points · Answer: {q.correctAnswer}</p></div>)}</div><form action={addQuestionAction} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="quizId" value={quiz.id} /><div className="md:col-span-2"><Label>Question</Label><Input name="prompt" required /></div><div><Label>Type</Label><Select name="type"><option value="MULTIPLE_CHOICE">Multiple choice</option><option value="TRUE_FALSE">True / false</option><option value="SHORT_ANSWER">Short answer</option></Select></div><div><Label>Correct answer</Label><Input name="correctAnswer" required /></div><div className="md:col-span-2"><Label>Options, one per line</Label><Textarea name="options" /></div><div><Label>Points</Label><Input name="points" type="number" defaultValue={1} /></div><div><Label>Order</Label><Input name="order" type="number" defaultValue={quiz.questions.length+1} /></div><div className="md:col-span-2"><SubmitButton size="sm" pendingText="Adding question...">Add question</SubmitButton></div></form></CardContent></Card>)}</div></>;
}
