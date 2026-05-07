"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-8">{error.message || "Unexpected application error."}</p>
      <button
        onClick={reset}
        className="px-5 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900"
      >
        Try again
      </button>
    </div>
  );
}
