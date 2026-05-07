"use client";

import { useCartStore } from "../store/useCartStore";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useHydration } from "../hooks/useHydration";
import { formatMoney, getProductCategory, getProductPalette } from "../utils/catalog";

export default function CartSidebar() {
  const { isSidebarOpen, closeSidebar, items, totalPrice, updateQuantity, removeFromCart } = useCartStore();
  const isHydrated = useHydration();

  if (!isHydrated || !isSidebarOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition-opacity"
        onClick={closeSidebar}
        aria-label="Close cart"
      />
      
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[24rem] flex-col border-l border-white/50 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
            <ShoppingBag className="h-5 w-5" /> Shopping Cart
          </h2>
          <button onClick={closeSidebar} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" aria-label="Close shopping cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="mt-24 flex flex-col items-center gap-3 text-center text-slate-400">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p className="text-sm">Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br ${getProductPalette(item.product)} text-2xl font-semibold text-white`}>
                  {item.product.name.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{getProductCategory(item.product)}</div>
                  <h3 className="line-clamp-1 font-semibold text-slate-950">{item.product.name}</h3>
                  <div className="mb-3 text-sm text-slate-500">{formatMoney(item.product.price)}</div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 transition-colors hover:bg-white disabled:opacity-30"
                        aria-label={`Decrease quantity of ${item.product.name}`}
                      >
                        <Minus className="h-3.5 w-3.5 text-slate-700" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-950">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 transition-colors hover:bg-white"
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        <Plus className="h-3.5 w-3.5 text-slate-700" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="rounded-full p-2 text-rose-500/70 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Remove item"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-lg font-semibold tracking-tight text-slate-950">
                  {formatMoney(item.lineTotal)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 bg-white/95 px-5 py-5 shadow-[0_-10px_40px_-15px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-end justify-between">
            <span className="text-sm font-medium text-slate-500">Subtotal</span>
            <span className="text-3xl font-semibold tracking-tight text-slate-950">{formatMoney(totalPrice)}</span>
          </div>
          <Link 
            href="/checkout"
            onClick={closeSidebar}
            className="flex w-full justify-center rounded-full bg-slate-950 px-4 py-4 font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:scale-[1.01] disabled:opacity-50"
            style={{ pointerEvents: items.length === 0 ? "none" : "auto", opacity: items.length === 0 ? 0.5 : 1 }}
          >
            Proceed to Secure Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
