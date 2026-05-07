"use client";

import Link from "next/link";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { formatMoney, getProductAccent, getProductBadge, getProductCategory, getProductPalette, getProductSummary } from "../utils/catalog";

interface Props { product: any }

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCartStore();
  const palette = getProductPalette(product);
  const accent = getProductAccent(product);
  const badge = getProductBadge(product);
  const category = getProductCategory(product);
  const summary = getProductSummary(product);

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/50 bg-white/70 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(15,23,42,0.12)]">
      <div className={`relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br ${palette}`}>
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`Open ${product.name}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_36%),linear-gradient(to_bottom,rgba(255,255,255,0.2),rgba(3,7,18,0.22))]" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <div className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-md">
            {category}
          </div>
          <div className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {badge}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/35 bg-white/12 text-5xl font-semibold text-white shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
            {accent}
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="max-w-[70%] rounded-[22px] bg-white/80 px-4 py-3 text-slate-900 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{summary || "Curated artifact"}</p>
            <p className="mt-1 text-base font-semibold leading-tight">{product.name}</p>
          </div>
          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product.id)}
              className="relative z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/30 transition-transform duration-300 hover:scale-105"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          ) : (
            <div className="relative z-20 inline-flex h-12 items-center justify-center rounded-full bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 backdrop-blur-md">
              Sold out
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.id}`} className="block text-lg font-semibold leading-tight text-slate-950 transition-opacity hover:opacity-70">
              {product.name}
            </Link>
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{summary}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            {badge}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-slate-950">{formatMoney(product.price)}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{product.stock} available</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              {product.stock > 0 ? "Ready to ship" : "Unavailable"}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
