"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courseSchema, lessonSchema, moduleSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { uploadPrivateFile } from "@/lib/storage";
import { resolveAvailableOrder } from "@/lib/order";
import { getYouTubeVideoId } from "@/lib/youtube";

export type ActionState = { error?: string; success?: string };

export async function inviteUserAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const department = String(formData.get("department") ?? "").trim() || null;
  if (!email.includes("@") || name.length < 2 || !["ADMIN", "MENTOR", "EMPLOYEE", "INTERN"].includes(role)) return { error: "Complete all required user fields." };
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name, role },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings`,
  });
  if (error || !data.user) return { error: error?.message ?? "Could not invite user." };
  await prisma.$transaction([
    prisma.user.upsert({
      where: { id: data.user.id },
      update: { email, name, role: role as "ADMIN", department, active: true },
      create: { id: data.user.id, email, name, role: role as "ADMIN", department },
    }),
    prisma.activityLog.create({ data: { actorId: admin.id, action: "Invited user", entityType: "User", entityId: data.user.id } }),
  ]);
  revalidatePath("/admin/users");
  return { success: `Invitation sent to ${email}.` };
}

export async function saveCourseAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid course." };
  const { id, ...data } = parsed.data;
  const slug = slugify(data.title);
  try {
    const course = id
      ? await prisma.course.update({ where: { id }, data: { ...data, slug } })
      : await prisma.course.create({ data: { ...data, slug } });
    const thumbnail = formData.get("thumbnail");
    if (thumbnail instanceof File && thumbnail.size > 0) {
      const thumbnailUrl = await uploadPrivateFile("course-files", `${course.id}/thumbnail-${Date.now()}-${thumbnail.name}`, thumbnail);
      await prisma.course.update({ where: { id: course.id }, data: { thumbnailUrl } });
    }
    await prisma.activityLog.create({ data: { actorId: admin.id, action: id ? "Updated course" : "Created course", entityType: "Course", entityId: course.id } });
    revalidatePath("/admin/courses");
    return { success: "Course saved." };
  } catch {
    return { error: "A course with this title may already exist." };
  }
}

export async function createModuleAction(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = moduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
  const existing = await prisma.module.findMany({
    where: { courseId: parsed.data.courseId },
    select: { order: true },
  });
  await prisma.module.create({
    data: {
      ...parsed.data,
      order: resolveAvailableOrder(parsed.data.order, existing.map((item) => item.order)),
    },
  });
  revalidatePath(`/admin/courses/${parsed.data.courseId}`);
}

export async function createLessonAction(formData: FormData) {
  await requireRole("ADMIN");
  const raw = Object.fromEntries(formData);
  const parsed = lessonSchema.safeParse({ ...raw, completionRequired: formData.get("completionRequired") === "on" });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
  if (parsed.data.type === "YOUTUBE" && (!parsed.data.videoUrl || !getYouTubeVideoId(parsed.data.videoUrl))) {
    throw new Error("Enter a valid YouTube watch, short, live, or youtu.be link.");
  }
  const existing = await prisma.lesson.findMany({
    where: { moduleId: parsed.data.moduleId },
    select: { order: true },
  });
  const lesson = await prisma.lesson.create({
    data: {
      ...parsed.data,
      order: resolveAvailableOrder(parsed.data.order, existing.map((item) => item.order)),
      videoUrl: parsed.data.videoUrl || null,
      externalUrl: parsed.data.externalUrl || null,
    },
  });
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const fileUrl = await uploadPrivateFile("lesson-files", `${lesson.id}/${Date.now()}-${file.name}`, file);
    await prisma.lesson.update({ where: { id: lesson.id }, data: { fileUrl } });
  }
  if (lesson.type === "ASSIGNMENT") await prisma.assignment.create({ data: { lessonId: lesson.id, instructions: parsed.data.content || "Complete the assigned task." } });
  if (lesson.type === "QUIZ") await prisma.quiz.create({ data: { lessonId: lesson.id, title: lesson.title, passMark: 70 } });
  const courseModule = await prisma.module.findUniqueOrThrow({ where: { id: parsed.data.moduleId } });
  revalidatePath(`/admin/courses/${courseModule.courseId}`);
}

export async function assignCourseAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const courseId = String(formData.get("courseId") ?? "");
  const learnerId = String(formData.get("learnerId") ?? "");
  const mentorId = String(formData.get("mentorId") ?? "") || null;
  const enrollment = await prisma.enrollment.upsert({
    where: { learnerId_courseId: { learnerId, courseId } },
    update: { mentorId },
    create: { learnerId, courseId, mentorId },
    include: { course: true },
  });
  await prisma.$transaction([
    prisma.notification.create({ data: { userId: learnerId, type: "COURSE_ASSIGNED", title: "New course assigned", message: `You have been assigned ${enrollment.course.title}.`, href: `/courses/${enrollment.course.slug}` } }),
    prisma.activityLog.create({ data: { actorId: admin.id, action: "Assigned course", entityType: "Enrollment", entityId: enrollment.id } }),
  ]);
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function addQuestionAction(formData: FormData) {
  await requireRole("ADMIN");
  const quizId = String(formData.get("quizId") ?? "");
  const type = String(formData.get("type") ?? "") as "MULTIPLE_CHOICE";
  const prompt = String(formData.get("prompt") ?? "");
  const correctAnswer = String(formData.get("correctAnswer") ?? "");
  const points = Number(formData.get("points") ?? 1);
  const order = Number(formData.get("order") ?? 1);
  const options = String(formData.get("options") ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
  if (!prompt || !correctAnswer) throw new Error("Question and answer are required.");
  const existing = await prisma.question.findMany({
    where: { quizId },
    select: { order: true },
  });
  await prisma.question.create({
    data: {
      quizId,
      type,
      prompt,
      correctAnswer,
      points,
      order: resolveAvailableOrder(order, existing.map((item) => item.order)),
      options: type === "MULTIPLE_CHOICE" ? options : undefined,
    },
  });
  revalidatePath("/admin/quizzes");
}
