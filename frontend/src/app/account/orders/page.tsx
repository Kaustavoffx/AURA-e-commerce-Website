"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useRequireAuth } from "../../../hooks/useRequireAuth";

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

export default function OrderHistoryPage() {
  const { ready } = useRequireAuth();
  const { token } = useCartStore();

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
        if (!res.ok) throw new Error("Failed to load orders");
        const json = await res.json();
        setOrders(json.data ?? []);
      } catch {
        setError("Unable to load order history.");
      } finally {
        setLoading(false);
      }
    }

    if (ready) {
      void loadOrders();
    }
  }, [token, ready]);

  if (!ready) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Checking authentication...</div>;
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Loading your orders...</div>;
  }

  if (error) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-red-600">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order History</h1>
        <p className="text-gray-500">You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Order History</h1>
      <div className="space-y-5">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <p className="font-mono text-sm text-gray-600">#{order.id.slice(0, 8)}</p>
              <span className="text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full w-fit">
                {order.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-gray-900 font-semibold">Total: ${order.totalPrice}</p>
            <p className="text-sm text-gray-500 mt-2">{order.items.length} item(s)</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
