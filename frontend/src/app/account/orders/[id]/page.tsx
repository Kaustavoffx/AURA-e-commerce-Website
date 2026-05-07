"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "../../../../store/useCartStore";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";

interface OrderItem {
  id: string;
  quantity: number;
  historicalPrice: string;
  product: {
    name: string;
    sku: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { ready } = useRequireAuth();
  const { token } = useCartStore();
  const params = useParams<{ id: string }>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load order details");
        const json = await res.json();
        setOrders(json.data ?? []);
      } catch {
        setError("Unable to load order details.");
      } finally {
        setLoading(false);
      }
    }

    if (ready) {
      void loadOrders();
    }
  }, [token, ready]);

  const order = useMemo(
    () => orders.find((entry) => entry.id === params?.id),
    [orders, params]
  );

  if (!ready) return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Checking authentication...</div>;
  if (loading) return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Loading order...</div>;
  if (error) return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-red-600">{error}</div>;
  if (!order) return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-600">Order not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Order #{order.id.slice(0, 8)}</h1>
      <p className="text-gray-500 mb-8">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full w-fit">
            {order.status}
          </span>
          <span className="text-2xl font-bold text-gray-900">${order.totalPrice}</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="font-semibold text-gray-900">{item.product.name}</p>
                <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="font-semibold text-gray-900">${item.historicalPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
