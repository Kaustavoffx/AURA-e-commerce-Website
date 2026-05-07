export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl animate-pulse">
      <div className="aspect-[4/5] w-full rounded-[22px] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
      <div className="mt-4 space-y-3">
        <div className="h-3.5 w-24 rounded-full bg-slate-200" />
        <div className="h-5 w-3/4 rounded-full bg-slate-200" />
        <div className="h-4 w-1/2 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
