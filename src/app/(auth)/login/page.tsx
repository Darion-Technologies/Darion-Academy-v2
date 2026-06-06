import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
      <section className="hidden bg-[#0d2341] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Brand inverse />
        <div className="max-w-xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-blue-300">Darion Technologies</p><h1 className="text-5xl font-bold leading-tight">Build skills that move our work forward.</h1><p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-300">Courses, practical assignments, mentor feedback, and recognized completion in one focused workspace.</p></div>
        <p className="text-sm text-slate-400">Internal learning and development workspace</p>
      </section>
      <section className="flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mb-7 mt-2 text-slate-500">Sign in with your Darion Academy account.</p>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-slate-400">Access is limited to invited Darion Technologies team members.</p>
        </div>
      </section>
    </main>
  );
}
