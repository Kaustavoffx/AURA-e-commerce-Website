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

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  const totalItems = isHydrated ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30 shadow-sm shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="text-2xl font-extrabold tracking-tighter text-gray-900">
              AURA<span className="text-blue-600">.</span>
            </Link>
          </div>

          <div className="hidden md:flex gap-8 font-medium text-sm text-gray-500">
            <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
            <Link href="/collections" className="hover:text-gray-900 transition-colors">Collections</Link>
            <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthed ? (
              <>
                <Link href="/account/orders" className="p-2 text-gray-400 hover:text-gray-900 transition-colors" aria-label="Go to account orders">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Login</Link>
                <Link href="/register" className="text-sm font-semibold text-white bg-black px-3 py-1.5 rounded-lg hover:bg-gray-900">Register</Link>
              </div>
            )}
            
            <button 
              onClick={openSidebar}
              className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2">
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Shop</Link>
            <Link href="/collections" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Collections</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">About</Link>
            {isAuthed ? (
              <>
                <Link href="/account/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">My Orders</Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 px-2 py-1">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Login</Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-white bg-black px-3 py-1.5 rounded-lg hover:bg-gray-900">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
