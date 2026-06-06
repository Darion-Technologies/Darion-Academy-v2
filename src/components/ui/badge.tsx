import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex rounded-none bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700", className)}>{children}</span>;
}
