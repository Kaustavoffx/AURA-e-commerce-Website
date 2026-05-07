"use client";

import { useState } from "react";
import { useCartStore } from "../../../../store/useCartStore";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();
  const { token } = useCartStore();
  const [form, setForm] = useState({ sku: "", name: "", price: "", stock: "0", attributes: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert("Not authenticated");
    const body = { sku: form.sku, name: form.name, price: Number(form.price), stock: Number(form.stock), attributes: form.attributes ? JSON.parse(form.attributes) : {} };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      const json = await res.json().catch(() => null);
      alert(json?.error?.message || 'Create failed');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded">
        <input placeholder="SKU" value={form.sku} onChange={(e)=>setForm({...form, sku:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <input placeholder="Price" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <input placeholder="Stock" value={form.stock} onChange={(e)=>setForm({...form, stock:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <textarea placeholder='Attributes JSON e.g. {"category":"gadgets"}' value={form.attributes} onChange={(e)=>setForm({...form, attributes:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Create</button>
        </div>
      </form>
    </div>
  );
}
