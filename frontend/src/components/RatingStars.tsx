"use client";

import { Star } from "lucide-react";

export default function RatingStars({ value = 4.5, count = 120 }: { value?: number; count?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < Math.round(value) ? "fill-current opacity-100" : "opacity-30"}`} />
        ))}
      </div>
      <div className="text-slate-600">
        {value.toFixed(1)} <span className="text-slate-400">({count})</span>
      </div>
    </div>
  );
}
