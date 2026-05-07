"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import ProductGallery from "../../../components/ProductGallery";
import RatingStars from "../../../components/RatingStars";
import { formatMoney, getProductCategory, getProductHighlights, getProductSummary } from "../../../utils/catalog";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  attributes?: Record<string, unknown>;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id;
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${productId}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const json = await res.json();
        setProduct(json.data ?? null);
      } catch {
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const images = useMemo(() => {
    if (!product?.attributes) return [];
    const rawImages = product.attributes.images;
    if (Array.isArray(rawImages)) {
      return rawImages.filter((value): value is string => typeof value === "string");
    }
    const singleImage = toText(product.attributes.imageUrl);
    return singleImage ? [singleImage] : [];
  }, [product]);

  const summary = product ? getProductSummary(product) : "";
  const category = product ? getProductCategory(product) : "General";
  const highlights = product ? getProductHighlights(product) : [];

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-slate-500 sm:px-6 lg:px-8">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-rose-600 sm:px-6 lg:px-8">{error ?? "Product not found."}</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-6">
          <ProductGallery
            productName={product.name}
            sku={product.sku}
            category={category}
            summary={summary}
            images={images}
          />

          <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Product details</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{product.name}</h1>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">SKU</div>
                <div className="mt-1 font-mono text-sm text-slate-700">{product.sku}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <RatingStars />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {category}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
              </span>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {(toText(product.attributes?.description) ?? summary) || "Premium product detail powered by the live catalog metadata."}
            </p>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Specifications</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Live attribute sheet</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {highlights.length > 0 ? highlights.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              )) : (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No extra attributes were provided for this product.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Reviews</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Customer feedback</h2>
              </div>
            </div>
            <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              No reviews yet. Be the first to review this product.
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Purchase panel</p>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatMoney(product.price)}</div>
                <div className="mt-2 text-sm text-slate-500">{product.stock > 0 ? `${product.stock} ready to ship` : "Currently unavailable"}</div>
              </div>
              <div className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                {category}
              </div>
            </div>

            <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Stock</span>
                <span className="font-semibold text-slate-950">{product.stock}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Summary</span>
                <span className="max-w-[12rem] text-right font-semibold text-slate-950">{summary || "Live catalog"}</span>
              </div>
            </div>

            <button
              onClick={() => addToCart(product.id)}
              disabled={product.stock === 0}
              className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {product.stock === 0 ? "Out of stock" : "Add to cart"}
            </button>

            <div className="mt-4 rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              Secure checkout • 30-day returns
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}