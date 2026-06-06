export function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden bg-slate-200 ${className}`}>
      <div className="h-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
