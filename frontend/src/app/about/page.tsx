export default function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">About AURA</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Premium commerce with a practical backbone.</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
          AURA combines a polished storefront with real product, order, and admin flows. The experience stays responsive, data-driven, and consistent from mobile screens to desktop dashboards.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["Curated catalog", "Products, collections, and categories are rendered from the live API."],
            ["Secure checkout", "JWT-authenticated checkout with backend validation and friendly error handling."],
            ["Operations-ready admin", "Role-protected product, order, user, and analytics views for staff."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
