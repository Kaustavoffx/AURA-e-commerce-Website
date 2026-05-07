"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";

export default function AdminAnalytics() {
  const { token } = useCartStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setStats(json.data ?? null);
      } catch (err) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token]);

  if (loading) return <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-10 text-slate-500">Loading analytics...</div>;

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Analytics</p>
            <h2 className="text-3xl font-semibold text-slate-950">Overview</h2>
            <p className="text-sm text-slate-500">Sales, conversion, and inventory metrics from the API.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Revenue</div>
              <div className="mt-1 text-lg font-semibold">${stats?.revenue ?? "0"}</div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Orders</div>
              <div className="mt-1 text-lg font-semibold">{stats?.orders ?? 0}</div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Conversion</div>
              <div className="mt-1 text-lg font-semibold">{stats?.conversion ?? "0%"}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <h3 className="text-sm font-semibold text-slate-700">Top Products</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(stats?.topProducts ?? []).map((p: any) => (
            <div key={p.id} className="rounded-[18px] border border-slate-200 bg-white p-3">
              <div className="text-sm font-semibold text-slate-900">{p.name}</div>
              <div className="mt-1 text-xs text-slate-500">{p.sales} sales</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
