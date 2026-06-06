import { updateProfileAction } from "@/app/actions/account";
import { PasswordForm } from "@/components/auth/password-form";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();
  return <><PageHeader title="Settings" description="Manage your profile and account security." /><div className="grid gap-6 md:grid-cols-2"><Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent><form action={updateProfileAction} className="space-y-3"><div><Label>Name</Label><Input name="name" defaultValue={user.name} required /></div><div><Label>Email</Label><Input value={user.email} disabled /></div><div><Label>Role</Label><Input value={user.role} disabled /></div><SubmitButton pendingText="Saving profile...">Save profile</SubmitButton></form></CardContent></Card><Card><CardHeader><CardTitle>Password</CardTitle></CardHeader><CardContent><PasswordForm /></CardContent></Card></div></>;
}
