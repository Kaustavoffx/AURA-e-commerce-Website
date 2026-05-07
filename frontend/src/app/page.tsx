"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Newsletter from "../components/Newsletter";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { formatMoney, getProductCategory, getProductPalette, getProductSummary } from "../utils/catalog";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  attributes?: Record<string, unknown>;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=20`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();
        if (json.success) setProducts(json.data ?? []);
      } catch {
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const featured = products.slice(0, 4);
  const trending = products.slice(4, 10);
  const hero = products[0];

  const categorySummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const category = getProductCategory(product);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return Array.from(counts.entries()).slice(0, 4);
  }, [products]);

  return (
    <main className="space-y-16 pb-10 lg:space-y-24">
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <div className="grid gap-6 overflow-hidden rounded-[36px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="flex flex-col justify-between gap-8 rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 p-6 text-white sm:p-8 lg:min-h-[34rem]">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              <span>AURA ARTIFACTS</span>
              <span>Premium commerce</span>
            </div>

            <div className="max-w-xl space-y-5">
              <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-md">
                Curated catalog
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">The art of practical luxury.</h1>
              <p className="max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                Explore a real catalog with responsive shopping, secure checkout, and admin tools built for the same visual language.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:-translate-y-0.5">
                  Shop Now
                </Link>
                <Link href="/collections" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-sm font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-white/15">
                  Browse Collections
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.24em] text-white/60">Products</div>
                <div className="mt-2 text-2xl font-semibold">{products.length || "—"}</div>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.24em] text-white/60">Categories</div>
                <div className="mt-2 text-2xl font-semibold">{categorySummary.length || "—"}</div>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.24em] text-white/60">Storefront</div>
                <div className="mt-2 text-2xl font-semibold">Live</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {loading && Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}

            {!loading && hero && (
              <article className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <div className={`relative overflow-hidden rounded-[26px] bg-gradient-to-br ${getProductPalette(hero)} p-6 text-white`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(3,7,18,0.26))]" />
                  <div className="relative flex min-h-[20rem] flex-col justify-between gap-8">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                      <span>{getProductCategory(hero)}</span>
                      <span>{hero.stock} in stock</span>
                    </div>
                    <div className="max-w-md space-y-4">
                      <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                        Featured product
                      </p>
                      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{hero.name}</h2>
                      <p className="text-sm leading-6 text-white/80">{getProductSummary(hero)}</p>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-white/60">Starting at</div>
                        <div className="mt-1 text-3xl font-semibold tracking-tight">{formatMoney(hero.price)}</div>
                      </div>
                      <Link href={`/products/${hero.id}`} className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:-translate-y-0.5">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Curated selections</h2>
            <p className="mt-1 text-sm text-slate-500">Real catalog items rendered from the API.</p>
          </div>
          <Link href="/shop" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 transition hover:text-slate-950">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Collections by category</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              Derived from the live catalog, not hard-coded merchandising blocks.
            </p>
            <div className="mt-6 space-y-3">
              {categorySummary.length > 0 ? categorySummary.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-900">{category}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{count} items</span>
                </div>
              )) : (
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">No categories available yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Trending now</h2>
                <p className="mt-1 text-sm text-slate-500">Live items from the catalog.</p>
              </div>
              <Link href="/shop" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 transition hover:text-slate-950">
                Shop all
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                : trending.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Fast checkout", "Secure sessions and resilient cart flows."],
            ["Role-aware admin", "Protected routes backed by server auth."],
            ["Responsive by default", "Layouts adjust from phone to desktop."],
            ["Real catalog data", "Products, categories, orders and users."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <h3 className="text-base font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <Newsletter />
      <Footer />
    </main>
  );
}