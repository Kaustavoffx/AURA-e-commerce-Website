"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useToastStore } from "../../store/useToastStore";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useCartStore();
  const { pushToast } = useToastStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "AURA - Authentication";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json?.data?.token) {
        throw new Error(json?.error?.message ?? "Login failed");
      }

      setToken(json.data.token);
      pushToast("Logged in successfully", "success");
      router.push("/shop");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl lg:grid-cols-2">
        <section className="relative hidden min-h-[38rem] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.18),transparent_22%)]" />
          <div className="relative z-10 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            <span>AURA</span>
            <span>Authentication</span>
          </div>
          <div className="relative z-10 max-w-md space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Secure access
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-white">Curated commerce, unlocked.</h1>
            <p className="max-w-xl text-base leading-7 text-white/80">
              Sign in to access your account, saved products, order history, and administrative tools when your role allows it.
            </p>
          </div>
          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <ShieldCheck className="h-5 w-5 text-amber-300" />
              <p className="mt-4 text-sm text-white/70">JWT protected sessions and role-aware routing.</p>
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-2xl font-semibold tracking-tight">Fast</div>
              <p className="mt-2 text-sm text-white/70">Instant cart sync, account redirect, and responsive shell.</p>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <div className="mx-auto flex max-w-xl flex-col justify-center">
            <div className="mb-8 lg:hidden">
              <div className="text-3xl font-semibold tracking-tight text-slate-950">AURA</div>
              <p className="mt-2 text-sm text-slate-500">Authentication</p>
            </div>

            <div className="mb-8 space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Welcome back.</h2>
              <p className="max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                Sign in to continue shopping or manage your admin dashboard if your account has elevated access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexander@example.com"
                  className="h-14 w-full rounded-full border border-slate-200 bg-white/90 px-5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 transition hover:text-slate-950">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 w-full rounded-full border border-slate-200 bg-white/90 px-5 pr-14 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-950"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/register"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-700 transition hover:bg-slate-50"
              >
                <span>Create Account</span>
              </Link>
            </form>

            <p className="mt-8 text-center text-xs leading-6 text-slate-400 sm:text-sm">
              By continuing, you agree to our <Link href="#" className="font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4">Terms of Service</Link> and <Link href="#" className="font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4">Privacy Policy</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}