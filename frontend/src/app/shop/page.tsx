"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import SkeletonCard from "../../components/SkeletonCard";
import { formatMoney, getProductCategory } from "../../utils/catalog";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  attributes?: Record<string, unknown>;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name-asc">("featured");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=100`);
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const json = await res.json();
        setProducts(json.data ?? []);
      } catch {
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const item of products) {
      values.add(getProductCategory(item));
    }
    return ["all", ...Array.from(values)];
  }, [products]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let result = products.filter((product) => {
      const byQuery = !normalized || product.name.toLowerCase().includes(normalized) || product.sku.toLowerCase().includes(normalized);
      const byCategory = category === "all" || getProductCategory(product) === category;
      return byQuery && byCategory;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, query, category, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query, category, sortBy]);

  const heroLabel = loading ? "Loading catalog" : `${filtered.length} live results`;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <section className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Shop catalog</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Artifacts</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">
              Browse the live catalog, refine by category, and sort by name or price using the same responsive layout on every device.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
            {[
              ["Results", heroLabel],
              ["Categories", categories.filter((value) => value !== "all").length.toString()],
              ["Price range", products.length ? `${formatMoney(Math.min(...products.map((item) => Number(item.price))))} - ${formatMoney(Math.max(...products.map((item) => Number(item.price))))}` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search catalog</label>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find an artifact..."
                className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>
          </div>

          <details open className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Categories</summary>
            <div className="mt-4 space-y-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-left text-sm font-medium transition ${category === item ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                >
                  <span>{item === "all" ? "All artifacts" : item}</span>
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${category === item ? "text-white/70" : "text-slate-400"}`}>
                    {item === "all" ? products.length : products.filter((entry) => getProductCategory(entry) === item).length}
                  </span>
                </button>
              ))}
            </div>
          </details>

          <details className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sort and reset</summary>
            <div className="mt-4 space-y-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-400"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setSortBy("featured");
                }}
                className="h-12 w-full rounded-full border border-slate-200 bg-white/80 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </details>
        </aside>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Showing</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{filtered.length} product{filtered.length === 1 ? "" : "s"}</div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400" htmlFor="sort">
                Sort
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-400"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: pageSize }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
          ) : paged.length === 0 ? (
            <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-10 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="text-lg font-semibold text-slate-950">No matching products found.</div>
              <p className="mt-2 text-sm text-slate-500">Try clearing filters or search with a different term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paged.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/80 px-4 py-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:flex-row">
            <span className="text-sm text-slate-500">
              Showing {Math.min((page - 1) * pageSize + 1, filtered.length)} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-sm text-slate-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}