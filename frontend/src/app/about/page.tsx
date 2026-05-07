export default function AboutPage() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">About AURA</h1>
      <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
        AURA is a modern online store built for a clean, premium shopping experience.
        We focus on curated products, secure checkout, and fast order tracking with a reliable full-stack architecture.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Curated Products</h2>
          <p className="text-sm text-gray-600">Thoughtfully selected catalog categories with real-time stock and pricing.</p>
        </article>
        <article className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Secure Checkout</h2>
          <p className="text-sm text-gray-600">Protected order flow with authentication, validation, and robust backend handling.</p>
        </article>
        <article className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Tracking</h2>
          <p className="text-sm text-gray-600">Users can review order history and details with a responsive account experience.</p>
        </article>
      </div>
    </section>
  );
}
