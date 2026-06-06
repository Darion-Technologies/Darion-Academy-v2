import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold tracking-tight ${inverse ? "text-white" : "text-slate-950"}`}>
      <span className="grid size-8 place-items-center bg-blue-600 text-sm text-white">D</span>
      <span>Darion <span className={inverse ? "text-blue-300" : "text-blue-700"}>Academy</span></span>
    </Link>
  );
}
