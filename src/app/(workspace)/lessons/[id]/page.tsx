import { completeLessonAction } from "@/app/actions/learning";
import { SubmissionForm } from "@/components/learning/submission-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSignedUrl } from "@/lib/storage";
import { getYouTubeVideoId } from "@/lib/youtube";
import { YouTubePlayer } from "@/components/learning/youtube-player";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { module: { include: { course: true } }, assignment: true, quiz: true } });
  if (!lesson) notFound();
  const enrollment = await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: lesson.module.courseId } } });
  const mentorAccess = user.role === "MENTOR"
    ? await prisma.enrollment.findFirst({ where: { mentorId: user.id, courseId: lesson.module.courseId }, select: { id: true } })
    : null;
  if (!enrollment && user.role !== "ADMIN" && !mentorAccess) notFound();
  const submission = lesson.assignment ? await prisma.submission.findUnique({ where: { assignmentId_learnerId: { assignmentId: lesson.assignment.id, learnerId: user.id } }, include: { feedback: { include: { author: true } } } }) : null;
  const lessonFileUrl = lesson.fileUrl ? await createSignedUrl("lesson-files", lesson.fileUrl) : null;
  const youtubeVideoId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null;
  const canComplete = user.role === "EMPLOYEE" || user.role === "INTERN";
  const existingProgress = canComplete ? await prisma.progress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }) : null;
  return <><div className="mb-6"><Link href={`/courses/${lesson.module.course.slug}`} className="text-sm text-blue-700">← Back to course</Link><div className="mt-3 flex items-center gap-3"><h1 className="text-2xl font-bold">{lesson.title}</h1><Badge>{lesson.type}</Badge></div><p className="mt-1 text-sm text-slate-500">{lesson.module.title}</p></div><div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]"><Card className={lesson.type === "YOUTUBE" ? "border-0 bg-transparent shadow-none" : undefined}><CardContent className={lesson.type === "YOUTUBE" ? "p-0" : "pt-5"}>
    {lesson.type === "YOUTUBE" && youtubeVideoId && <YouTubePlayer lessonId={lesson.id} videoId={youtubeVideoId} canComplete={canComplete} initiallyCompleted={existingProgress?.completed ?? false} />}
    {lesson.type === "YOUTUBE" && lesson.videoUrl && !youtubeVideoId && <div className="border border-amber-300 bg-amber-50 p-4"><p className="text-sm text-amber-900">This saved URL cannot be embedded.</p><Button className="mt-3" variant="outline" asChild><a href={lesson.videoUrl} target="_blank" rel="noreferrer">Open on YouTube</a></Button></div>}
    {lesson.type === "LINK" && lesson.externalUrl && <Button asChild><a href={lesson.externalUrl} target="_blank" rel="noreferrer">Open resource</a></Button>}
    {lessonFileUrl && <Button variant="outline" asChild><a href={lessonFileUrl} target="_blank" rel="noreferrer">Open lesson file</a></Button>}
    {lesson.content && <div className="prose-content whitespace-pre-wrap text-sm">{lesson.content}</div>}
    {lesson.assignment && <div className="mt-6"><h2 className="mb-2 font-semibold">Assignment</h2><p className="mb-5 text-sm text-slate-600">{lesson.assignment.instructions}</p><SubmissionForm assignmentId={lesson.assignment.id} allowText={lesson.assignment.allowText} allowFile={lesson.assignment.allowFile} allowLink={lesson.assignment.allowLink} /></div>}
    {lesson.quiz && <Button className="mt-5" asChild><Link href={`/quizzes/${lesson.quiz.id}`}>Take quiz</Link></Button>}
  </CardContent></Card><div className="space-y-5"><Card><CardHeader><CardTitle>Lesson status</CardTitle></CardHeader><CardContent>{submission && <p className="mb-3 text-sm">Submission: <Badge>{submission.status}</Badge></p>}{lesson.type === "YOUTUBE" && <p className="text-sm text-slate-500">{existingProgress?.completed ? "Completed" : "Completion unlocks when the video ends."}</p>}{!lesson.assignment && !lesson.quiz && lesson.type !== "YOUTUBE" && canComplete && <form action={completeLessonAction}><input type="hidden" name="lessonId" value={lesson.id} /><SubmitButton className="w-full" pendingText="Completing...">Mark complete</SubmitButton></form>}</CardContent></Card>{submission?.feedback.length ? <Card><CardHeader><CardTitle>Mentor feedback</CardTitle></CardHeader><CardContent className="space-y-3">{submission.feedback.map((f) => <div key={f.id} className="rounded-none bg-slate-50 p-3"><p className="text-sm">{f.message}</p><p className="mt-2 text-xs text-slate-500">{f.author.name}</p></div>)}</CardContent></Card> : null}</div></div></>;
}
