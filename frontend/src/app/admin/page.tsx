"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "../../store/useCartStore";
import { formatMoney, getProductCategory, getProductPalette } from "../../utils/catalog";

export default function AdminDashboard() {
  const { token } = useCartStore();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error?.message ?? "Failed to load admin overview");
        }
        setOverview(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin overview");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  const metrics = useMemo(() => {
    if (!overview) return [];
    return [
      { label: "Products", value: overview.totals.totalProducts },
      { label: "Orders", value: overview.totals.totalOrders },
      { label: "Revenue", value: formatMoney(overview.totals.totalRevenue ?? 0) },
      { label: "Users", value: overview.totals.totalUsers },
    ];
  }, [overview]);

  if (loading) return <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-10 text-slate-500 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">Loading admin dashboard...</div>;
  if (error) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700">{error}</div>;
  if (!overview) return <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-4 text-slate-500">No admin data available.</div>;

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Admin dashboard</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Overview</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Monitor store health, revenue, and operational queues from live API data.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products/create" className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              New product
            </Link>
            <Link href="/admin/orders" className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              View orders
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{metric.label}</div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Recent orders</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Live order feed</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 transition hover:text-slate-950">
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {overview.recentOrders?.length ? overview.recentOrders.map((order: any) => {
              const firstProduct = order.items?.[0]?.product;
              const palette = firstProduct ? getProductPalette(firstProduct) : "from-slate-900 via-slate-700 to-slate-400";
              return (
                <Link key={order.id} href="/admin/orders" className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br ${palette} text-sm font-semibold text-white`}>
                      {firstProduct?.name?.slice(0, 1) ?? "#"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">Order {order.id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{order.items.length} items • {order.status}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-950">{formatMoney(order.totalPrice)}</div>
                </Link>
              );
            }) : (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No recent orders yet.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Low stock</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Replenish soon</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {overview.lowStock?.length ? overview.lowStock.map((product: any) => (
                <div key={product.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{product.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{getProductCategory(product)}</div>
                    </div>
                    <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">{product.stock} left</div>
                  </div>
                </div>
              )) : (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No low stock items detected.</div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick links</p>
            <div className="mt-4 grid gap-3">
              <Link href="/admin/products" className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Manage products</Link>
              <Link href="/admin/users" className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Review users</Link>
              <Link href="/admin/analytics" className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Open analytics</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}