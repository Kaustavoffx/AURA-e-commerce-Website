"use client";

import Link from "next/link";
import { ShoppingBag, Menu, User } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useHydration } from "../hooks/useHydration";

export default function Navigation() {
  const { openSidebar, items } = useCartStore();
  const isHydrated = useHydration();

  const totalItems = isHydrated ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30 shadow-sm shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors">
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
            <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <User className="w-5 h-5" />
            </button>
            
            <button 
              onClick={openSidebar}
              className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
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
      </div>
    </nav>
  );
}
