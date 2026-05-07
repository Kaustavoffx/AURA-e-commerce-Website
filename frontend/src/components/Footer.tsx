export default function Footer() {
  return (
    <footer className="site-footer mt-24 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold mb-3">AURA</h4>
          <p className="text-sm text-gray-300">Premium goods crafted with care. Fast shipping. Hassle-free returns.</p>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-2">Shop</h5>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>All Products</li>
            <li>Collections</li>
            <li>Gift Cards</li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-2">Customer</h5>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>Help Center</li>
            <li>Track Order</li>
            <li>Returns</li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-2">Contact</h5>
          <p className="text-sm text-gray-300">support@aura.example</p>
          <p className="text-sm text-gray-300 mt-4">© {new Date().getFullYear()} Aura, Inc.</p>
        </div>
      </div>
    </footer>
  );
}
