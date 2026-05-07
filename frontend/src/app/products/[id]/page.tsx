"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import ProductGallery from "../../../components/ProductGallery";
import RatingStars from "../../../components/RatingStars";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  attributes?: Record<string, unknown>;
  imageUrl?: string;
  description?: string;
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
      } catch (err) {
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-red-600">{error ?? "Product not found."}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <ProductGallery images={product.imageUrl ? [product.imageUrl] : []} />
          <div className="mt-6 bg-white p-6 rounded-2xl card">
            <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4"><RatingStars /></div>
            <p className="mt-4 text-gray-700">{product.description ?? 'High quality product.'}</p>
          </div>

          <div className="mt-6 bg-white p-6 rounded-2xl card">
            <h2 className="text-xl font-semibold mb-3">Specifications</h2>
            <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{JSON.stringify(product.attributes ?? {}, null, 2)}</pre>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Reviews</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100">No reviews yet. Be the first to review this product.</div>
            </div>
          </div>
        </div>

        <aside className="sticky top-24">
          <div className="bg-white p-6 rounded-2xl card">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">${product.price}</div>
              <div className="text-sm text-gray-500">{product.stock > 0 ? 'In stock' : 'Out of stock'}</div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-600">Quantity</label>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => addToCart(product.id)} disabled={product.stock===0} className="flex-1 px-4 py-3 bg-black text-white rounded-lg">{product.stock===0? 'Out of Stock' : 'Add to Cart'}</button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">Secure checkout • 30-day returns</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
