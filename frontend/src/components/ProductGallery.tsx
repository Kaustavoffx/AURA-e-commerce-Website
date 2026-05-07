"use client";

import { useMemo, useState } from "react";
import { getProductAccent, getProductCategory, getProductPalette, getProductSummary } from "../utils/catalog";

interface Props {
  productName: string;
  sku: string;
  category?: string;
  summary?: string;
  images?: string[];
}

export default function ProductGallery({ productName, sku, category, summary, images = [] }: Props) {
  const [active, setActive] = useState(0);
  const seed = useMemo(() => ({
    id: sku,
    sku,
    name: productName,
    price: 0,
    stock: 0,
    attributes: { category },
  }), [category, productName, sku]);

  const swatch = getProductPalette(seed);
  const accent = getProductAccent(seed);
  const categoryLabel = category ?? getProductCategory(seed);
  const detailLine = summary ?? getProductSummary(seed);

  const visibleImages = images.length > 0 ? images : ["", "", "", ""];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <div className={`relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br ${swatch} shadow-[0_20px_70px_rgba(15,23,42,0.12)]`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.68),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(3,7,18,0.28))]" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
          <div className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-md">
            {categoryLabel}
          </div>
          <div className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {sku}
          </div>
        </div>
        <div className="flex min-h-[28rem] items-center justify-center p-8 sm:p-12">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-[40px] border border-white/35 bg-white/12 text-6xl font-semibold text-white shadow-2xl shadow-slate-950/25 backdrop-blur-sm">
              {accent}
            </div>
            <div className="max-w-md rounded-[24px] bg-white/80 px-5 py-4 text-slate-900 backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{categoryLabel}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{productName}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{detailLine || "Premium product detail surfaced from your catalog metadata."}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {visibleImages.map((image, index) => {
          const isActive = index === active;
          return (
            <button
              key={`${sku}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`group relative overflow-hidden rounded-[24px] border bg-white/75 p-4 text-left shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 ${isActive ? "border-slate-950/20 ring-1 ring-slate-950/15" : "border-white/60"}`}
            >
              <div className={`aspect-[4/3] rounded-[20px] bg-gradient-to-br ${swatch} overflow-hidden`}>
                <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_36%),linear-gradient(to_bottom,rgba(255,255,255,0.12),rgba(3,7,18,0.18))]" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">View {index + 1}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{isActive ? "Active view" : `Perspective ${index + 1}`}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isActive ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {isActive ? "Selected" : "Open"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
