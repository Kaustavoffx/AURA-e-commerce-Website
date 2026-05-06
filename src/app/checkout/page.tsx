"use client";

import { useState } from "react";
import { useCartStore } from "../../store/useCartStore";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, token, clearCartOptimistic } = useCartStore();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    zip: "",
    cardNumber: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ transactionId: string; orderId: string } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zip.trim() || formData.zip.length < 5) newErrors.zip = "Valid ZIP is required";
    
    const cardDigits = formData.cardNumber.replace(/\D/g, "");
    if (cardDigits.length !== 16) {
      newErrors.cardNumber = "Valid 16-digit card number required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:3000/api/v1/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ cardNumber: formData.cardNumber }),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccessData({
          transactionId: json.data.transactionId,
          orderId: json.data.order.id,
        });
        clearCartOptimistic(); // Clear cart purely on the frontend
      } else {
        setErrors({ general: json.error?.message || "Checkout failed." });
      }
    } catch (err) {
      setErrors({ general: "A network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Order Confirmed!</h1>
        <p className="text-xl text-gray-500 mb-12 max-w-lg">
          Thank you for your purchase. Your order has been processed securely.
        </p>
        
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-black/5 text-left w-full max-w-lg space-y-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-5">
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="font-mono text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">{successData.orderId.split('-')[0]}...</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Transaction Ref</span>
            <span className="font-mono text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">{successData.transactionId}</span>
          </div>
        </div>

        <Link href="/" className="mt-12 text-black font-semibold hover:underline">
          &larr; Return to Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* Checkout Form */}
        <div className="xl:col-span-7">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Secure Checkout</h2>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {errors.general && (
              <div className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium shadow-sm">
                {errors.general}
              </div>
            )}
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-8">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-5 py-4 rounded-xl border ${errors.name ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-black/5 focus:border-black'} outline-none transition-all`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-500 font-medium">{errors.name}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className={`w-full px-5 py-4 rounded-xl border ${errors.address ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-black/5 focus:border-black'} outline-none transition-all`}
                    placeholder="123 Aura Ave"
                  />
                  {errors.address && <p className="mt-2 text-sm text-red-500 font-medium">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className={`w-full px-5 py-4 rounded-xl border ${errors.city ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-black/5 focus:border-black'} outline-none transition-all`}
                  />
                  {errors.city && <p className="mt-2 text-sm text-red-500 font-medium">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                    className={`w-full px-5 py-4 rounded-xl border ${errors.zip ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-black/5 focus:border-black'} outline-none transition-all`}
                  />
                  {errors.zip && <p className="mt-2 text-sm text-red-500 font-medium">{errors.zip}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-8">Payment Method</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                  className={`w-full px-5 py-4 rounded-xl border ${errors.cardNumber ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-black/5 focus:border-black'} outline-none transition-all font-mono tracking-widest text-lg`}
                  placeholder="4444 4444 4444 4444"
                />
                {errors.cardNumber && <p className="mt-2 text-sm text-red-500 font-medium">{errors.cardNumber}</p>}
                <p className="mt-4 text-sm text-gray-500 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                  For testing, use <code className="bg-white px-2 py-1 rounded border border-gray-200 text-black shadow-sm">4444 4444 4444 4444</code>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full flex items-center justify-center py-5 px-8 bg-black text-white text-xl font-bold rounded-2xl hover:bg-gray-900 active:scale-[0.99] transition-all shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing Payment...</>
              ) : (
                `Pay $${totalPrice}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="xl:col-span-5">
          <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 sticky top-24">
            <h3 className="text-2xl font-bold mb-8 tracking-tight">Order Summary</h3>
            
            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {items.length === 0 ? (
                <p className="text-gray-500 italic">Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-5 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center font-extrabold text-2xl text-gray-300 shrink-0 border border-gray-100 group-hover:bg-gray-100 transition-colors">
                      {item.product.name.charAt(0)}
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="font-semibold text-gray-900 leading-tight mb-1">{item.product.name}</h4>
                      <p className="text-gray-500 text-sm font-medium">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900 text-lg py-1">${item.lineTotal}</div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 pt-8 space-y-4">
              <div className="flex justify-between text-gray-500 font-medium text-lg">
                <span>Subtotal</span>
                <span className="text-gray-900">${totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium text-lg">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium text-lg pb-6 border-b border-gray-100">
                <span>Taxes</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-3xl font-extrabold text-gray-900 pt-4 tracking-tight">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
