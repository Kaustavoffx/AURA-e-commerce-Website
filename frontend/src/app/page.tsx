"use client";

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import SkeletonCard from "../components/SkeletonCard";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=20`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();
        if (json.success) setProducts(json.data);
      } catch (err) {
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const featured = products.slice(0, 4);
  const trending = products.slice(4, 12);

  return (
    <main>
      <section className="bg-gradient-to-b from-white to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Elevate your everyday</h1>
            <p className="text-lg text-gray-600 mb-6">Curated premium products for modern living — designed to feel effortless.</p>
            <div className="flex gap-4">
              <a href="/shop" className="px-6 py-3 rounded-lg bg-black text-white font-semibold">Shop Collection</a>
              <a href="/collections" className="px-6 py-3 rounded-lg border border-gray-200">Explore Collections</a>
            </div>
          </div>

          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden card relative h-56">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop" alt="hero" className="object-cover w-full h-full" />
            </div>
            <div className="rounded-2xl overflow-hidden card relative h-56">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop" alt="hero" className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (<SkeletonCard key={i} />))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Trending</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? Array.from({length:8}).map((_,i)=>(<SkeletonCard key={i}/>)) : trending.map(p => (<ProductCard key={p.id} product={p}/>))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl p-6 card">Electronics</div>
          <div className="rounded-2xl p-6 card">Apparel</div>
          <div className="rounded-2xl p-6 card">Home</div>
          <div className="rounded-2xl p-6 card">Accessories</div>
        </div>
      </section>

      <Newsletter />

      <Footer />
    </main>
  );
}
