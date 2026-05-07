"use client";

import Link from "next/link";
import { ShoppingBag, Menu, User } from "lucide-react";
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
    <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-16">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors" onClick={() => setIsMobileMenuOpen((p) => !p)} aria-label="Toggle menu"><Menu className="w-6 h-6"/></button>
            <Link href="/" className="text-2xl font-extrabold tracking-tighter text-gray-900 select-none">AURA<span className="text-indigo-600">.</span></Link>
          </div>

          <div className="hidden lg:flex flex-1 items-center">
            <div className="w-2/3 mx-auto">
              <form action="/shop" className="relative">
                <input value={query} onChange={(e)=>setQuery(e.target.value)} name="q" placeholder="Search products, brands and categories" className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-12 shadow-sm" />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-black text-white">Search</button>
              </form>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex gap-6 text-sm text-gray-600 font-medium">
              <Link href="/shop" className="hover:text-gray-900">Shop</Link>
              <Link href="/collections" className="hover:text-gray-900">Collections</Link>
              <Link href="/about" className="hover:text-gray-900">About</Link>
            </div>

            <div className="relative">
              <button onClick={()=>setAccountOpen(p=>!p)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <User className="w-5 h-5 text-gray-600" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-3">
                  {isAuthed ? (
                    <>
                      <Link href="/account/orders" className="block py-2 text-sm text-gray-700">Orders</Link>
                      <button onClick={()=>logout()} className="w-full text-left py-2 text-sm text-gray-700">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block py-2 text-sm text-gray-700">Login</Link>
                      <Link href="/register" className="block py-2 text-sm text-gray-700">Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={openSidebar} className="relative p-2 text-gray-600 hover:text-gray-900">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-indigo-600 rounded-full">{totalItems}</span>}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <div className="space-y-2">
              <Link href="/shop" className="block px-2 py-2">Shop</Link>
              <Link href="/collections" className="block px-2 py-2">Collections</Link>
              <Link href="/about" className="block px-2 py-2">About</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
