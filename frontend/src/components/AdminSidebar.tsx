"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, Home, LogOut, ShoppingBag, Users } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

export default function AdminSidebar() {
  const { logout } = useCartStore();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Overview", icon: Home },
    { href: "/admin/products", label: "Products", icon: Boxes },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <aside className="hidden h-fit w-[18rem] shrink-0 rounded-[32px] border border-white/70 bg-white/80 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:block">
      <div className="space-y-6">
        <div className="rounded-[24px] bg-slate-950 px-5 py-5 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">AURA Admin</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Command center</div>
          <p className="mt-3 text-sm leading-6 text-white/70">Products, orders, users, and analytics in one responsive shell.</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-slate-200 pt-4">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-[20px] bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
