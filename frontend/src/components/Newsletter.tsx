export default function Newsletter() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12 bg-gradient-to-r from-white/5 to-white/3 rounded-2xl card">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Join our newsletter</h3>
          <p className="text-sm text-gray-500">Get early access to promotions and product drops.</p>
        </div>
        <form className="flex w-full md:w-auto gap-3">
          <input aria-label="Email" placeholder="you@domain.com" className="px-4 py-3 rounded-lg border border-gray-200" />
          <button className="px-4 py-3 rounded-lg bg-black text-white">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
