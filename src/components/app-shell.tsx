import {
  Award, BarChart3, Bell, BookOpen, ClipboardCheck, FileQuestion, GraduationCap,
  LayoutDashboard, LayoutTemplate, LogOut, Settings, Users,
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { UserRole } from "@/generated/prisma";
import { initials } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

const common = [
  { href: "/courses", label: "My courses", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/notifications", label: "Notifications", icon: Bell },
];
const admin = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/submissions", label: "Submissions", icon: ClipboardCheck },
  { href: "/admin/quizzes", label: "Quizzes", icon: FileQuestion },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/certificate-templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
];
const mentor = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/learners", label: "Learners", icon: Users },
  { href: "/mentor/submissions", label: "Reviews", icon: ClipboardCheck },
];

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: UserRole };
  children: React.ReactNode;
}) {
  const links = user.role === "ADMIN" ? admin : user.role === "MENTOR" ? mentor : [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, ...common];
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden min-h-screen bg-[#0d2341] text-slate-200 lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-5"><Brand inverse /></div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm font-medium hover:border-blue-400 hover:bg-white/10 hover:text-white">
              <Icon className="size-4" />{label}
            </Link>
          ))}
          {(user.role === "ADMIN" || user.role === "MENTOR") && common.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm font-medium hover:border-blue-400 hover:bg-white/10 hover:text-white">
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link href="/settings" className="mb-2 flex items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm hover:border-blue-400 hover:bg-white/10"><Settings className="size-4" />Settings</Link>
          <form action={logoutAction}><SubmitButton variant="ghost" pendingText="Signing out..." className="w-full justify-start text-slate-200 hover:bg-white/10 hover:text-white"><LogOut className="size-4" />Sign out</SubmitButton></form>
        </div>
      </aside>
      <div>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="lg:hidden"><Brand /></div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs capitalize text-slate-500">{user.role.toLowerCase()}</p></div>
            <span className="grid size-9 place-items-center bg-blue-100 text-xs font-bold text-blue-800">{initials(user.name)}</span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-white p-2 lg:hidden">
          {links.slice(0, 5).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex min-w-14 flex-col items-center gap-1 p-1 text-[10px] text-slate-600"><Icon className="size-5" />{label}</Link>)}
        </nav>
      </div>
    </div>
  );
}
