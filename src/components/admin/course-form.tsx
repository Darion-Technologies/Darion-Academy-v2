"use client";

import { useActionState } from "react";
import { saveCourseAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CourseForm() {
  const [state, action, pending] = useActionState(saveCourseAction, {});
  return <form action={action} className="grid gap-4 md:grid-cols-2">
    <div><Label>Title</Label><Input name="title" required /></div>
    <div><Label>Category</Label><Input name="category" required /></div>
    <div><Label>Difficulty</Label><Select name="difficulty"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></Select></div>
    <div><Label>Estimated minutes</Label><Input name="estimatedMinutes" type="number" defaultValue={60} min={1} required /></div>
    <div><Label>Status</Label><Select name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></Select></div>
    <div><Label>Thumbnail</Label><Input name="thumbnail" type="file" accept="image/*" /></div>
    <div className="md:col-span-2"><Label>Description</Label><Textarea name="description" required /></div>
    {state.error && <p className="text-sm text-red-600 md:col-span-2">{state.error}</p>}
    {state.success && <p className="text-sm text-emerald-600 md:col-span-2">{state.success}</p>}
    <div className="md:col-span-2"><Button disabled={pending}>{pending ? "Saving..." : "Create course"}</Button></div>
  </form>;
}
