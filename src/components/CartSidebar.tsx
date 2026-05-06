"use client";

import { useCartStore } from "../store/useCartStore";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartSidebar() {
  const { isSidebarOpen, closeSidebar, items, totalPrice, updateQuantity, removeFromCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for Zustand persisted state
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isSidebarOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
        onClick={closeSidebar}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <ShoppingBag className="w-5 h-5" /> Shopping Cart
          </h2>
          <button onClick={closeSidebar} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 flex flex-col items-center gap-3">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</h3>
                  <div className="text-sm text-gray-500 mb-3">${item.product.price}</div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-700" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-700" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-red-500/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="font-bold text-gray-900 text-lg">
                  ${item.lineTotal}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-6">
            <span className="font-medium text-gray-500">Subtotal</span>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">${totalPrice}</span>
          </div>
          <Link 
            href="/checkout"
            onClick={closeSidebar}
            className="w-full flex justify-center py-4 px-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-black/10"
            style={{ pointerEvents: items.length === 0 ? "none" : "auto", opacity: items.length === 0 ? 0.5 : 1 }}
          >
            Proceed to Secure Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
