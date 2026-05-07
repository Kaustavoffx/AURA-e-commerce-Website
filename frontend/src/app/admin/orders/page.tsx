"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { formatMoney, getProductPalette } from "../../../utils/catalog";

const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

export default function AdminOrdersPage() {
  const { token } = useCartStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/orders?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error?.message ?? "Unable to load orders");
        }
        setOrders(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load orders");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  const metrics = useMemo(() => {
    const pending = orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status)).length;
    const shipped = orders.filter((order) => ["shipped", "delivered"].includes(order.status)).length;
    return [
      ["Total orders", orders.length.toString()],
      ["Pending", pending.toString()],
      ["Shipped", shipped.toString()],
    ];
  }, [orders]);

  async function updateStatus(id: string, status: string) {
    if (!token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
    } else {
      const json = await res.json().catch(() => null);
      alert(json?.error?.message ?? "Status update failed");
    }
  }

  if (loading) return <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-10 text-slate-500 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">Loading orders...</div>;
  if (error) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700">{error}</div>;

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Operations</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Orders</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Monitor order state transitions and push status updates from one responsive queue.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[24rem]">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        {orders.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500">No orders available.</div>
        ) : (
          orders.map((order) => {
            const firstProduct = order.items?.[0]?.product;
            const palette = firstProduct ? getProductPalette(firstProduct) : "from-slate-900 via-slate-700 to-slate-400";
            return (
              <article key={order.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${palette} text-sm font-semibold text-white`}>
                      {order.id.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">Order {order.id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{order.items.length} items • {new Date(order.createdAt).toLocaleString()}</div>
                      <div className="mt-2 text-sm text-slate-500">Customer total: {formatMoney(order.totalPrice)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {order.status}
                    </span>
                    <select
                      defaultValue={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-400"
                    >
                      {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}