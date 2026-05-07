"use client";

import { useToastStore } from "../store/useToastStore";

export default function ToastViewport() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed top-20 right-4 z-[100] space-y-2 w-[320px] max-w-[calc(100vw-2rem)]"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`w-full text-left px-4 py-3 rounded-xl shadow-lg border transition-all ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
