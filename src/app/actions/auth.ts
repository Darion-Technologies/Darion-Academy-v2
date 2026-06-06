"use server";

import { loginSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { roleHome } from "@/lib/auth";
import { redirect } from "next/navigation";

type AuthState = { error?: string; success?: string };

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: error?.message ?? "Unable to sign in." };
  const profile = await prisma.user.findUnique({ where: { id: data.user.id } });
  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return { error: "Your Darion Academy profile is not active." };
  }
  redirect(roleHome[profile.role]);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updatePasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must contain at least 8 characters." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { error: error.message } : { success: "Password updated. You can continue to the academy." };
}
