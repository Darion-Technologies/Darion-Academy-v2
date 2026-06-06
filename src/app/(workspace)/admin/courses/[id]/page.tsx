import { createLessonAction, createModuleAction } from "@/app/actions/admin";
import { assignCourseTemplateAction } from "@/app/actions/certificates";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN"); const { id } = await params;
  const [course, certificateTemplates] = await Promise.all([
    prisma.course.findUniqueOrThrow({ where: { id }, include: { modules: { include: { lessons: true }, orderBy: { order: "asc" } } } }),
    prisma.certificateTemplate.findMany({ where: { status: "ACTIVE" }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);
  const firstModuleNextOrder = course.modules[0]
    ? Math.max(0, ...course.modules[0].lessons.map((lesson) => lesson.order)) + 1
    : 1;
  return <><PageHeader title={course.title} description="Manage modules, lessons, and certificate design." /><div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]"><div className="space-y-6"><Card><CardHeader><CardTitle>Certificate template</CardTitle></CardHeader><CardContent><form action={assignCourseTemplateAction} className="space-y-3"><input type="hidden" name="courseId" value={course.id}/><div><Label>Template</Label><Select name="templateId" defaultValue={course.certificateTemplateId ?? ""}><option value="">Use global default</option>{certificateTemplates.map((template)=><option key={template.id} value={template.id}>{template.name}{template.isDefault?" (default)":""}</option>)}</Select></div><SubmitButton pendingText="Assigning...">Save template</SubmitButton></form></CardContent></Card><Card><CardHeader><CardTitle>Add module</CardTitle></CardHeader><CardContent><form action={createModuleAction} className="space-y-3"><input type="hidden" name="courseId" value={course.id} /><div><Label>Title</Label><Input name="title" required /></div><div><Label>Description</Label><Textarea name="description" /></div><div><Label>Order</Label><Input name="order" type="number" defaultValue={course.modules.length + 1} /></div><SubmitButton pendingText="Adding module...">Add module</SubmitButton></form></CardContent></Card>
  {course.modules.length > 0 && <Card><CardHeader><CardTitle>Add lesson</CardTitle></CardHeader><CardContent><form action={createLessonAction} className="space-y-3"><div><Label>Module</Label><Select name="moduleId">{course.modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</Select></div><div><Label>Title</Label><Input name="title" required /></div><div><Label>Type</Label><Select name="type">{["TEXT","YOUTUBE","PDF","LINK","ASSIGNMENT","QUIZ"].map((v) => <option key={v}>{v}</option>)}</Select></div><div><Label>Content / instructions</Label><Textarea name="content" /></div><div><Label>YouTube URL</Label><Input name="videoUrl" placeholder="https://www.youtube.com/watch?v=..." /><p className="mt-1 text-xs text-slate-500">Watch, youtu.be, Shorts, Live, and embed links are supported.</p></div><div><Label>External URL</Label><Input name="externalUrl" /></div><div><Label>Lesson file</Label><Input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={firstModuleNextOrder} /><p className="mt-1 text-xs text-slate-500">Occupied positions append automatically.</p></div><div><Label>Minutes</Label><Input name="estimatedMinutes" type="number" defaultValue={10} /></div></div><label className="flex gap-2 text-sm"><input type="checkbox" name="completionRequired" defaultChecked /> Required for completion</label><SubmitButton pendingText="Adding lesson...">Add lesson</SubmitButton></form></CardContent></Card>}</div>
  <div className="space-y-4">{course.modules.map((module) => <Card key={module.id}><CardHeader><CardTitle>{module.order}. {module.title}</CardTitle></CardHeader><CardContent>{module.lessons.length ? <ol className="space-y-2">{module.lessons.sort((a,b)=>a.order-b.order).map((lesson) => <li key={lesson.id} className="flex items-center justify-between rounded-none border p-3"><div><p className="font-medium">{lesson.order}. {lesson.title}</p><p className="text-xs text-slate-500">{lesson.type}</p></div>{lesson.completionRequired && <span className="text-xs text-blue-700">Required</span>}</li>)}</ol> : <p className="text-sm text-slate-500">No lessons yet.</p>}</CardContent></Card>)}</div></div></>;
}
