import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full rounded-none border bg-white px-3 text-sm outline-none focus:border-blue-500", className)} {...props}>{children}</select>;
}
