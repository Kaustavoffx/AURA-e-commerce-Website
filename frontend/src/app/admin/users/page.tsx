"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";

export default function AdminUsersPage() {
  const { token } = useCartStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error?.message ?? "Unable to load users");
        }
        setUsers(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load users");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  const totals = useMemo(() => {
    return [
      ["Users", users.length.toString()],
      ["Admins", users.filter((user) => user.role === "admin").length.toString()],
      ["Customers", users.filter((user) => user.role === "customer").length.toString()],
    ];
  }, [users]);

  if (loading) return <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-10 text-slate-500 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">Loading users...</div>;
  if (error) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700">{error}</div>;

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Directory</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Users</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Review live users and role assignments from the authenticated admin API.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[24rem]">
            {totals.map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-950">{user.email}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <div className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.24em] ${user.role === "admin" ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}>
                {user.role}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}