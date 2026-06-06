import * as React from "react";
import { cn } from "@/lib/utils";

export function Table(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return <div className="w-full overflow-auto"><table className="w-full text-sm" {...props} /></div>;
}
export function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead className="border-b bg-slate-50/70" {...props} />; }
export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TableRow(props: React.HTMLAttributes<HTMLTableRowElement>) { return <tr className="border-b last:border-0 hover:bg-slate-50/60" {...props} />; }
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn("h-11 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", className)} {...props} />; }
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("px-4 py-3", className)} {...props} />; }
