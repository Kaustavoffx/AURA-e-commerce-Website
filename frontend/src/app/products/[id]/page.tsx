"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  attributes?: Record<string, unknown>;
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12">
        <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
        <p className="text-2xl font-semibold text-gray-900 mb-2">${product.price}</p>
        <p className="text-gray-500 mb-8">
          {product.stock > 0 ? `${product.stock} in stock` : "Currently out of stock"}
        </p>

        <button
          onClick={() => addToCart(product.id)}
          disabled={product.stock === 0}
          className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Attributes</h2>
            <pre className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(product.attributes, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
