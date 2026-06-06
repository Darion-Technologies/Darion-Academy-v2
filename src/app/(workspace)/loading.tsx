export default function Loading() {
  return <div className="space-y-5 animate-pulse"><div className="h-8 w-64 rounded-none bg-slate-200" /><div className="grid gap-4 sm:grid-cols-4">{[1,2,3,4].map((i)=><div key={i} className="h-28 rounded-none bg-slate-200" />)}</div><div className="h-72 rounded-none bg-slate-200" /></div>;
}
