"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useCartStore } from "../../../store/useCartStore";
import { useToastStore } from "../../../store/useToastStore";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
}

export default function AdminProductsPage() {
  const { ready } = useRequireAuth("admin");
  const { token } = useCartStore();
  const { pushToast } = useToastStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", price: "", stock: "" });

  async function loadProducts() {
    setTableError(null);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=100`);
    if (!res.ok) {
      throw new Error("Failed to load products");
    }
    const json = await res.json();
    setProducts(json.data ?? []);
  }

  useEffect(() => {
    async function init() {
      if (!ready) return;
      try {
        await loadProducts();
      } catch {
        setTableError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [ready]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    const priceNumber = Number(form.price);
    const stockNumber = Number(form.stock);
    if (!form.sku.trim() || !form.name.trim() || Number.isNaN(priceNumber) || Number.isNaN(stockNumber)) {
      pushToast("Please provide valid product inputs", "error");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sku: form.sku,
        name: form.name,
        price: priceNumber,
        stock: stockNumber,
        attributes: {},
      }),
    });

    if (!res.ok) {
      pushToast("Failed to create product", "error");
      return;
    }

    pushToast("Product created", "success");
    setForm({ sku: "", name: "", price: "", stock: "" });
    try {
      await loadProducts();
    } catch {
      setTableError("Unable to refresh products.");
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      pushToast("Failed to delete product", "error");
      return;
    }

    pushToast("Product deleted", "success");
    try {
      await loadProducts();
    } catch {
      setTableError("Unable to refresh products.");
    }
  }

  if (!ready) return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Checking admin access...</div>;
  if (loading) return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Loading products...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Product Management</h1>

      <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} placeholder="SKU" required className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black" />
        <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Name" required className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black" />
        <input value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} placeholder="Price" required className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black" />
        <input value={form.stock} onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))} placeholder="Stock" required className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black" />
        <button type="submit" className="md:col-span-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900">Add Product</button>
      </form>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-x-auto">
        {tableError && <p className="px-4 pt-4 text-sm text-red-600">{tableError}</p>}
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-gray-600 text-sm">
              <th className="p-4">SKU</th>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <td className="p-4 text-gray-700">{product.sku}</td>
                <td className="p-4 text-gray-900 font-medium">{product.name}</td>
                <td className="p-4 text-gray-700">${product.price}</td>
                <td className="p-4 text-gray-700">{product.stock}</td>
                <td className="p-4">
                  <button onClick={() => void handleDelete(product.id)} className="text-red-600 hover:text-red-700 font-semibold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
