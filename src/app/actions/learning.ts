"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreQuiz } from "@/lib/quiz";
import { refreshEnrollmentProgress } from "@/lib/progress";
import { uploadPrivateFile } from "@/lib/storage";

export async function completeLessonAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const lessonId = String(formData.get("lessonId") ?? "");
  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId }, include: { module: { include: { course: true } } } });
  const enrollment = await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: lesson.module.courseId } } });
  if (!enrollment) throw new Error("You are not enrolled in this course.");
  if (lesson.type === "YOUTUBE" && formData.get("videoCompleted") !== "true") {
    throw new Error("Watch the video to the end before completing this lesson.");
  }
  await prisma.progress.upsert({ where: { userId_lessonId: { userId: user.id, lessonId } }, update: { completed: true, completedAt: new Date() }, create: { userId: user.id, lessonId, completed: true, completedAt: new Date() } });
  await refreshEnrollmentProgress(prisma, user.id, lesson.module.courseId);
  revalidatePath(`/courses/${lesson.module.course.slug}`);
}

type SubmissionState = { error?: string; success?: string };

export async function submitAssignmentAction(_state: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const textAnswer = String(formData.get("textAnswer") ?? "").trim() || null;
  const externalUrl = String(formData.get("externalUrl") ?? "").trim() || null;
  const file = formData.get("file");
  const assignment = await prisma.assignment.findUniqueOrThrow({ where: { id: assignmentId }, include: { lesson: { include: { module: { include: { course: true } } } } } });
  const enrollment = await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: assignment.lesson.module.courseId } } });
  if (!enrollment) return { error: "You are not enrolled in this course." };
  let fileUrl: string | null = null;
  if (file instanceof File && file.size > 0) fileUrl = await uploadPrivateFile("submissions", `${user.id}/${assignmentId}/${Date.now()}-${file.name}`, file);
  if (!textAnswer && !externalUrl && !fileUrl) return { error: "Provide a text answer, link, or file." };
  await prisma.submission.upsert({
    where: { assignmentId_learnerId: { assignmentId, learnerId: user.id } },
    update: { textAnswer, externalUrl, fileUrl: fileUrl ?? undefined, status: "SUBMITTED", submittedAt: new Date(), reviewedAt: null, reviewerId: null },
    create: { assignmentId, learnerId: user.id, textAnswer, externalUrl, fileUrl, status: "SUBMITTED", submittedAt: new Date() },
  });
  await prisma.notification.createMany({ data: [
    ...(enrollment.mentorId ? [{ userId: enrollment.mentorId, type: "GENERAL" as const, title: "Task submitted", message: `${user.name} submitted ${assignment.lesson.title}.`, href: "/mentor/submissions" }] : []),
  ] });
  revalidatePath(`/lessons/${assignment.lessonId}`);
  return { success: "Your assignment was submitted for review." };
}

export async function submitQuizAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const quizId = String(formData.get("quizId") ?? "");
  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId }, include: { questions: true, lesson: { include: { module: { include: { course: true } } } }, attempts: { where: { userId: user.id } } } });
  const enrollment = await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: quiz.lesson.module.courseId } } });
  if (!enrollment) throw new Error("You are not enrolled in this course.");
  if (quiz.maxAttempts && quiz.attempts.length >= quiz.maxAttempts) throw new Error("Maximum attempts reached.");
  const answers = Object.fromEntries(quiz.questions.map((question) => [question.id, String(formData.get(`question-${question.id}`) ?? "")]));
  const result = scoreQuiz(quiz.questions, answers, quiz.passMark);
  const attempt = await prisma.quizAttempt.create({
    data: { quizId, userId: user.id, score: result.score, earnedPoints: result.earnedPoints, totalPoints: result.totalPoints, status: result.passed ? "PASSED" : "FAILED", submittedAt: new Date(), answers: { create: result.graded } },
  });
  await refreshEnrollmentProgress(prisma, user.id, quiz.lesson.module.courseId);
  redirect(`/quizzes/${quizId}/result?attempt=${attempt.id}`);
}
