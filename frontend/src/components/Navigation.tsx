"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useHydration } from "../hooks/useHydration";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { openSidebar, items, token, logout, initializeAuth } = useCartStore();
  const isHydrated = useHydration();
  const isAuthed = isHydrated && Boolean(token);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  const totalItems = isHydrated ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_4px_30px_rgba(15,23,42,0.05)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4 sm:h-20">
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
            onClick={() => setIsMobileMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">
            AURA
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <form action="/shop" className="w-full max-w-2xl">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  name="q"
                  placeholder="Search products, brands, categories"
                  className="h-12 w-full rounded-full border border-slate-200 bg-white/80 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </label>
            </form>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
              <Link href="/shop" className="transition hover:text-slate-950">Shop</Link>
              <Link href="/collections" className="transition hover:text-slate-950">Collections</Link>
              <Link href="/about" className="transition hover:text-slate-950">About</Link>
            </div>

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 transition hover:bg-slate-50"
              onClick={() => setAccountOpen((p) => !p)}
              aria-label="Account menu"
            >
              <User className="h-5 w-5" />
            </button>

            <button
              onClick={openSidebar}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white transition hover:scale-105"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-slate-950">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 py-4 md:hidden">
            <div className="grid gap-2 text-sm font-medium text-slate-600">
              <Link href="/shop" className="rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100">Shop</Link>
              <Link href="/collections" className="rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100">Collections</Link>
              <Link href="/about" className="rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100">About</Link>
              <Link href="/login" className="rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100">Login</Link>
            </div>
          </div>
        )}

        {accountOpen && (
          <div className="absolute right-4 top-[4.75rem] w-56 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:right-6">
            {isAuthed ? (
              <>
                <Link href="/account/orders" className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">Orders</Link>
                <button onClick={() => logout()} className="mt-1 block w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">Login</Link>
                <Link href="/register" className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
