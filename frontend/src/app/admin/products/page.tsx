"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { formatMoney, getProductCategory, getProductPalette } from "../../../utils/catalog";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  attributes?: Record<string, unknown>;
}

export default function AdminProductsPage() {
  const { token } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ sku: "", name: "", price: "", stock: "0", attributes: "{}" });
  const [submitting, setSubmitting] = useState(false);

  async function loadProducts() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=100`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => !normalized || product.name.toLowerCase().includes(normalized) || product.sku.toLowerCase().includes(normalized));
  }, [products, query]);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setCreateError(null);

    try {
      const parsedAttributes = form.attributes.trim() ? JSON.parse(form.attributes) : {};
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          attributes: parsedAttributes,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Create failed");
      }

      setForm({ sku: "", name: "", price: "", stock: "0", attributes: "{}" });
      await loadProducts();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    const confirmed = confirm("Delete this product? This cannot be undone.");
    if (!confirmed) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setProducts((current) => current.filter((item) => item.id !== id));
    } else {
      const json = await res.json().catch(() => null);
      alert(json?.error?.message ?? "Delete failed");
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Inventory</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Products</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Manage the live catalog, create new items, and remove products when inventory changes.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
            {[
              ["Total", products.length.toString()],
              ["Visible", filtered.length.toString()],
              ["Low stock", products.filter((item) => item.stock < 10).length.toString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Catalog</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Live product list</h2>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SKU or name"
              className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400 sm:max-w-xs"
            />
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500">Loading products...</div>
            ) : error ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-5 text-sm text-rose-700">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500">No products match your search.</div>
            ) : filtered.map((product) => (
              <div key={product.id} className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br ${getProductPalette(product)} text-white`}>
                    {product.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{product.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{product.sku} • {getProductCategory(product)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:text-right">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{formatMoney(product.price)}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{product.stock} in stock</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 transition hover:bg-slate-50">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 transition hover:bg-rose-100">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick create</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">New product</h2>
          </div>

          <form onSubmit={handleCreateProduct} className="mt-5 space-y-4">
            {createError && <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>}
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400" />
              <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400" />
            </div>
            <textarea
              value={form.attributes}
              onChange={(e) => setForm({ ...form, attributes: e.target.value })}
              placeholder='Attributes JSON, e.g. {"category":"Electronics"}'
              className="min-h-36 w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
            <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white disabled:opacity-50">
              {submitting ? "Creating..." : "Create product"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}