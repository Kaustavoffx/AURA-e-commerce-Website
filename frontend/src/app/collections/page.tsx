"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: string;
  attributes?: {
    category?: string;
  };
}

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=100`);
        if (!res.ok) {
          throw new Error("Failed to fetch collections");
        }
        const json = await res.json();
        setProducts(json.data ?? []);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const grouped = useMemo(() => {
    return products.reduce<Record<string, Product[]>>((acc, product) => {
      const category = product.attributes?.category ?? "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});
  }, [products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Collections</h1>
        <p className="text-gray-500">Loading collections...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Collections</h1>
        <p className="text-gray-500">No collection items found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Collections</h1>
      <div className="space-y-10">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-500">${item.price}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
