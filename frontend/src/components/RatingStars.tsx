"use client";

import { Star } from "lucide-react";

export default function RatingStars({ value = 4.5, count = 120 }: { value?: number; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-yellow-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < Math.round(value) ? 'opacity-100' : 'opacity-30'}`} />
        ))}
      </div>
      <div className="text-sm text-gray-500">{value.toFixed(1)} ({count})</div>
    </div>
  );
}
