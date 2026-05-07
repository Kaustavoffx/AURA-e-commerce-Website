"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "../../../../../store/useCartStore";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { token } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ sku: "", name: "", price: "", stock: 0, attributes: {} });

  useEffect(() => {
    async function load() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`);
      const json = await res.json();
      if (res.ok) setForm(json.data);
      setLoading(false);
    }
    if (id) void load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert("Not authenticated");
    const body = { sku: form.sku, name: form.name, price: Number(form.price), stock: Number(form.stock), attributes: form.attributes };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (res.ok) router.push("/admin/products");
    else {
      const json = await res.json().catch(() => null);
      alert(json?.error?.message || 'Update failed');
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded">
        <input placeholder="SKU" value={form.sku} onChange={(e)=>setForm({...form, sku:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <input placeholder="Price" value={String(form.price)} onChange={(e)=>setForm({...form, price:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <input placeholder="Stock" value={String(form.stock)} onChange={(e)=>setForm({...form, stock:e.target.value})} className="w-full px-4 py-3 border rounded" />
        <textarea placeholder='Attributes JSON' value={JSON.stringify(form.attributes ?? {})} onChange={(e)=>{try{setForm({...form, attributes: JSON.parse(e.target.value)})}catch{}}} className="w-full px-4 py-3 border rounded" />
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save</button>
        </div>
      </form>
    </div>
  );
}
