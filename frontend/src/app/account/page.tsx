"use client";

import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useCartStore } from "../../store/useCartStore";

export default function AccountPage() {
  const { ready } = useRequireAuth();
  const { userRole } = useCartStore();

  if (!ready) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Checking authentication...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/account/orders" className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order History</h2>
          <p className="text-gray-500">Track previous purchases and order statuses.</p>
        </Link>
        {userRole === "admin" && (
          <Link href="/admin" className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-500">Manage products and store controls.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
