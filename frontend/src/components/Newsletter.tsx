export default function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Newsletter</p>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Join the AURA briefing.</h3>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Get product drops, collection updates, and store news before everyone else.</p>
          </div>
          <form className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
            <input
              aria-label="Email"
              placeholder="you@domain.com"
              className="h-12 flex-1 rounded-full border border-slate-200 bg-white px-5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
            <button className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:scale-[1.01]">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
