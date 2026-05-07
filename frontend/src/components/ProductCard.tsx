"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

interface Props { product: any }

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCartStore();

  const imageSrc = product.imageUrl || `https://images.unsplash.com/photo-1606813902626-6f8f5a5f5a8f?q=80&w=1200&auto=format&fit=crop`;

  return (
    <div className="group card bg-white overflow-hidden rounded-2xl transition-transform transform hover:-translate-y-1 hover:shadow-premium">
      <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden">
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`Open ${product.name}`} />
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover w-full h-full image-zoom"
          priority={false}
        />
        <div className="absolute top-3 left-3 bg-white/80 text-xs font-semibold text-gray-800 px-2 py-1 rounded-full">{product.collection || 'New'}</div>
        {product.stock === 0 && (
          <div className="absolute top-3 right-3 bg-gray-900 text-white text-xs px-2 py-1 rounded-full">Sold out</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 truncate" title={product.name}>{product.name}</h3>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-sm text-yellow-500"><Star className="w-4 h-4"/>4.6</div>
          <div className="text-xs text-gray-500">(120)</div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">${product.price}</div>
            {product.discount && (
              <div className="text-xs text-green-600">{product.discount}% off</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addToCart(product.id)}
              disabled={product.stock === 0}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white hover:bg-gray-900 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
