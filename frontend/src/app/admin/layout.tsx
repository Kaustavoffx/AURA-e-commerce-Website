"use client";

import AdminSidebar from "../../components/AdminSidebar";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth("admin");

  if (!ready) return <div className="p-8">Checking admin access...</div>;

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-slate-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <header className="mb-6 rounded-[30px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">AURA Admin</div>
                <div className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Command center</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/admin" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </Link>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
