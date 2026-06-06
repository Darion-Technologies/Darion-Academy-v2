"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <div><Label htmlFor="email">Work email</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@darion.com" required /></div>
      <div><div className="flex justify-between"><Label htmlFor="password">Password</Label></div><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {state.error && <p className="rounded-none bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <Button className="w-full" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}
