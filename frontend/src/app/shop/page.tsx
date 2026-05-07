"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  attributes?: {
    category?: string;
  };
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name-asc">("featured");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=50`);
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const json = await res.json();
        setProducts(json.data ?? []);
      } catch (err) {
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const item of products) {
      if (item.attributes?.category) values.add(item.attributes.category);
    }
    return ["all", ...Array.from(values)];
  }, [products]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let result = products.filter((product) => {
      const byQuery = !normalized || product.name.toLowerCase().includes(normalized);
      const byCategory = category === "all" || product.attributes?.category === category;
      return byQuery && byCategory;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, query, category, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query, category, sortBy]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shop</h1>
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shop</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shop</h1>
        <p className="text-gray-500">No products available yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Shop</h1>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 mb-8 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          className="md:col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-black"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-black bg-white"
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {value === "all" ? "All Categories" : value}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc" | "name-asc")}
          className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-black bg-white"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
        </select>
      </div>

      {paged.length === 0 ? (
        <div className="text-gray-500">No matching products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paged.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h2>
            <p className="text-gray-500 mb-2">${product.price}</p>
            <p className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
          className="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages}
          className="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
