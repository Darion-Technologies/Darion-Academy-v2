import { PrismaClient, UserRole } from "../src/generated/prisma";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const demoUsers = [
  { email: "admin@darion.tech", name: "Aarav Sharma", role: UserRole.ADMIN, department: "Operations", passwordKey: "DEMO_ADMIN_PASSWORD" },
  { email: "mentor@darion.tech", name: "Meera Nair", role: UserRole.MENTOR, department: "Engineering", passwordKey: "DEMO_MENTOR_PASSWORD" },
  { email: "employee@darion.tech", name: "Rohan Patel", role: UserRole.EMPLOYEE, department: "Engineering", passwordKey: "DEMO_EMPLOYEE_PASSWORD" },
  { email: "intern@darion.tech", name: "Ananya Rao", role: UserRole.INTERN, department: "Product", passwordKey: "DEMO_INTERN_PASSWORD" },
];

async function ensureAuthUser(item: typeof demoUsers[number]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list.users.find((user) => user.email === item.email);
  if (existing) return existing.id;
  const { data, error } = await supabase.auth.admin.createUser({
    email: item.email,
    password: process.env[item.passwordKey] || "ChangeMe123!",
    email_confirm: true,
    user_metadata: { name: item.name, role: item.role },
  });
  if (error || !data.user) throw error ?? new Error(`Could not create ${item.email}`);
  return data.user.id;
}

async function main() {
  const ids = new Map<string, string>();
  for (const item of demoUsers) {
    const id = await ensureAuthUser(item);
    ids.set(item.role, id);
    await prisma.user.upsert({
      where: { id },
      update: { email: item.email, name: item.name, role: item.role, department: item.department },
      create: { id, email: item.email, name: item.name, role: item.role, department: item.department },
    });
  }
  const course = await prisma.course.upsert({
    where: { slug: "secure-web-application-foundations" },
    update: {},
    create: {
      title: "Secure Web Application Foundations",
      slug: "secure-web-application-foundations",
      description: "Learn Darion's practical baseline for secure, maintainable web application delivery.",
      category: "Engineering",
      difficulty: "BEGINNER",
      estimatedMinutes: 150,
      status: "PUBLISHED",
    },
  });
  const certificateTemplate = await prisma.certificateTemplate.upsert({
    where: { name: "Corporate" },
    update: { isDefault: true, status: "ACTIVE" },
    create: { name: "Corporate", isDefault: true, status: "ACTIVE" },
  });
  await prisma.certificateTemplate.updateMany({
    where: { id: { not: certificateTemplate.id } },
    data: { isDefault: false },
  });
  await prisma.course.update({
    where: { id: course.id },
    data: { certificateTemplateId: certificateTemplate.id },
  });
  let foundation = await prisma.module.findFirst({ where: { courseId: course.id, order: 1 } });
  foundation ??= await prisma.module.create({ data: { courseId: course.id, title: "Core foundations", description: "Orientation, secure coding, and applied practice.", order: 1 } });
  let intro = await prisma.lesson.findFirst({ where: { moduleId: foundation.id, order: 1 } });
  intro ??= await prisma.lesson.create({ data: { moduleId: foundation.id, title: "Welcome and learning outcomes", type: "TEXT", order: 1, estimatedMinutes: 15, content: "Welcome to Darion Academy.\n\nIn this course you will learn the secure engineering baseline used across Darion Technologies projects." } });
  let assignmentLesson = await prisma.lesson.findFirst({ where: { moduleId: foundation.id, order: 2 } });
  assignmentLesson ??= await prisma.lesson.create({ data: { moduleId: foundation.id, title: "Threat-model a login flow", type: "ASSIGNMENT", order: 2, estimatedMinutes: 45, content: "Document assets, trust boundaries, and the three highest-priority threats." } });
  await prisma.assignment.upsert({ where: { lessonId: assignmentLesson.id }, update: {}, create: { lessonId: assignmentLesson.id, instructions: "Submit a concise threat model for a password-based login flow. Include assets, boundaries, threats, and mitigations." } });
  let quizLesson = await prisma.lesson.findFirst({ where: { moduleId: foundation.id, order: 3 } });
  quizLesson ??= await prisma.lesson.create({ data: { moduleId: foundation.id, title: "Security foundations check", type: "QUIZ", order: 3, estimatedMinutes: 20 } });
  const quiz = await prisma.quiz.upsert({ where: { lessonId: quizLesson.id }, update: {}, create: { lessonId: quizLesson.id, title: "Security foundations check", passMark: 70 } });
  if (!await prisma.question.count({ where: { quizId: quiz.id } })) {
    await prisma.question.createMany({ data: [
      { quizId: quiz.id, prompt: "Which principle grants only the permissions required?", type: "MULTIPLE_CHOICE", options: ["Defense in depth", "Least privilege", "Fail open"], correctAnswer: "Least privilege", points: 2, order: 1 },
      { quizId: quiz.id, prompt: "Server-side authorization is required even when UI controls are hidden.", type: "TRUE_FALSE", correctAnswer: "True", points: 1, order: 2 },
      { quizId: quiz.id, prompt: "Name the practice of converting input into an expected safe form.", type: "SHORT_ANSWER", correctAnswer: "normalization", points: 1, order: 3 },
    ] });
  }
  const mentorId = ids.get(UserRole.MENTOR)!;
  for (const role of [UserRole.EMPLOYEE, UserRole.INTERN]) {
    const learnerId = ids.get(role)!;
    const enrollment = await prisma.enrollment.upsert({
      where: { learnerId_courseId: { learnerId, courseId: course.id } },
      update: { mentorId },
      create: { learnerId, courseId: course.id, mentorId },
    });
    await prisma.notification.upsert({
      where: { id: `seed-${enrollment.id}` },
      update: {},
      create: { id: `seed-${enrollment.id}`, userId: learnerId, type: "COURSE_ASSIGNED", title: "Welcome to Darion Academy", message: `${course.title} has been assigned to you.`, href: `/courses/${course.slug}` },
    });
  }
  console.log("Seeded demo users and learning content.");
}

main().finally(() => prisma.$disconnect());
