export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8 lg:py-16">
        <div className="space-y-4">
          <div className="text-3xl font-semibold tracking-tight text-slate-950">AURA</div>
          <p className="max-w-md text-sm leading-6 text-slate-500">
            Premium commerce with a clean catalog, secure checkout, and role-aware admin tooling.
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            © {new Date().getFullYear()} Aura, Inc.
          </p>
        </div>

        <div>
          <h5 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-900">Shop</h5>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li>All Products</li>
            <li>Collections</li>
            <li>Gift Cards</li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-900">Customer</h5>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li>Help Center</li>
            <li>Track Order</li>
            <li>Returns</li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-900">Contact</h5>
          <p className="mt-4 text-sm text-slate-500">support@aura.example</p>
          <p className="mt-3 text-sm text-slate-500">Mon-Fri, 9am-6pm</p>
        </div>
      </div>
    </footer>
  );
}
