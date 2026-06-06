"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="rounded-none border bg-white p-10 text-center"><h2 className="text-xl font-semibold">Something went wrong</h2><p className="mt-2 text-sm text-slate-500">The requested workspace data could not be loaded.</p><Button className="mt-5" onClick={reset}>Try again</Button></div>;
}
