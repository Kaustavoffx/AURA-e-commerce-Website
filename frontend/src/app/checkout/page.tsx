"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useHydration } from "../../hooks/useHydration";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useToastStore } from "../../store/useToastStore";
import { formatMoney, getProductPalette } from "../../utils/catalog";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, token, clearCartOptimistic } = useCartStore();
  const isHydrated = useHydration();
  const { ready } = useRequireAuth();
  const { pushToast } = useToastStore();

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

  const cartAccent = useMemo(() => (items[0] ? getProductPalette(items[0].product) : "from-slate-900 via-slate-700 to-slate-400"), [items]);

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
    if (!token) {
      setErrors({ general: "Please login to continue checkout." });
      pushToast("Please login to checkout", "info");
      router.replace("/login");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardNumber: formData.cardNumber }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.order?.id && json?.data?.transactionId) {
        setSuccessData({
          transactionId: json.data.transactionId,
          orderId: json.data.order.id,
        });
        clearCartOptimistic();
        pushToast("Order placed successfully", "success");
        router.push(`/account/orders/${json.data.order.id}`);
      } else {
        const apiMessage = json?.error?.message || json?.message || "Checkout failed.";
        setErrors({ general: apiMessage });
        pushToast(apiMessage, "error");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to reach checkout service.";
      setErrors({ general: message });
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || !ready) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  if (successData) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-full border border-emerald-200 bg-emerald-50 p-6 shadow-inner">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Order confirmed.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
          Your order has been processed securely. You can review the receipt and order updates in your account area.
        </p>

        <div className="mt-10 w-full rounded-[28px] border border-white/70 bg-white/85 p-6 text-left shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Order ID</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{successData.orderId}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Transaction</div>
              <div className="mt-2 font-mono text-sm text-slate-600">{successData.transactionId}</div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              Continue shopping
            </Link>
            <Link href={`/account/orders/${successData.orderId}`} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              View order
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <section className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Secure checkout
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Checkout</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">
              Review shipping details, complete payment, and place the order with the same responsive experience on mobile and desktop.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
            {[
              ["Step 1", "Account"],
              ["Step 2", "Shipping"],
              ["Step 3", "Payment"],
            ].map(([step, label], index) => (
              <div key={step} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{step}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            {errors.general && (
              <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errors.general}
              </div>
            )}

            <section className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Contact</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Contact information</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Full name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alexander Vault"
                    className={`h-14 w-full rounded-full border bg-white px-5 text-slate-950 outline-none placeholder:text-slate-400 ${errors.name ? "border-rose-300" : "border-slate-200 focus:border-slate-400"}`}
                  />
                  {errors.name && <p className="mt-2 text-sm text-rose-600">{errors.name}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Street address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Luxury Lane"
                    className={`h-14 w-full rounded-full border bg-white px-5 text-slate-950 outline-none placeholder:text-slate-400 ${errors.address ? "border-rose-300" : "border-slate-200 focus:border-slate-400"}`}
                  />
                  {errors.address && <p className="mt-2 text-sm text-rose-600">{errors.address}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    className={`h-14 w-full rounded-full border bg-white px-5 text-slate-950 outline-none placeholder:text-slate-400 ${errors.city ? "border-rose-300" : "border-slate-200 focus:border-slate-400"}`}
                  />
                  {errors.city && <p className="mt-2 text-sm text-rose-600">{errors.city}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">ZIP code</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="10001"
                    className={`h-14 w-full rounded-full border bg-white px-5 text-slate-950 outline-none placeholder:text-slate-400 ${errors.zip ? "border-rose-300" : "border-slate-200 focus:border-slate-400"}`}
                  />
                  {errors.zip && <p className="mt-2 text-sm text-rose-600">{errors.zip}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Payment</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Payment details</h2>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Card number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    placeholder="4444 4444 4444 4444"
                    className={`h-14 w-full rounded-full border bg-white px-5 pr-14 font-mono tracking-[0.24em] text-slate-950 outline-none placeholder:text-slate-400 ${errors.cardNumber ? "border-rose-300" : "border-slate-200 focus:border-slate-400"}`}
                  />
                  <ShieldCheck className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.cardNumber && <p className="mt-2 text-sm text-rose-600">{errors.cardNumber}</p>}
              </div>
            </section>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>{loading ? "Processing payment..." : `Pay ${formatMoney(totalPrice)}`}</span>
            </button>
          </form>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Order summary</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Your bag</h3>
              </div>
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${cartAccent}`} />
            </div>

            <div className="mt-5 max-h-[24rem] space-y-4 overflow-y-auto pr-1 custom-scrollbar">
              {items.length === 0 ? (
                <p className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br ${getProductPalette(item.product)} text-xl font-semibold text-white`}>
                      {item.product.name.slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-950">{item.product.name}</h4>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Qty {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-slate-950">{formatMoney(item.lineTotal)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-950">{formatMoney(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600">Complimentary</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Estimated taxes</span>
                <span className="font-medium text-slate-950">Included at review</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-xl font-semibold tracking-tight text-slate-950">Total</span>
              <span className="text-3xl font-semibold tracking-tight text-slate-950">{formatMoney(totalPrice)}</span>
            </div>

            <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Lock className="mr-2 inline-block h-3.5 w-3.5" />
              Secure encrypted checkout
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}