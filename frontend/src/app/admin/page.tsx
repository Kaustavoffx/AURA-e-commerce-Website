"use client";

import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";

export default function AdminPage() {
  const { ready } = useRequireAuth("admin");

  if (!ready) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-500">Checking admin access...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/products" className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Management</h2>
          <p className="text-gray-500">Create, edit, and delete products.</p>
        </Link>
      </div>
    </div>
  );
}
