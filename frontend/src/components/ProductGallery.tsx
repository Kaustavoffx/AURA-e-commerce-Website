"use client";

import Image from "next/image";
import { useState } from "react";

interface Props { images: string[] }

export default function ProductGallery({ images = [] }: Props) {
  const [active, setActive] = useState(0);

  const thumb = (src: string) => src || `https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden card">
        <Image src={thumb(images[active])} alt={`Product image ${active+1}`} fill className="object-cover" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: Math.max(4, images.length) }).map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className={`relative w-full aspect-[1/1] rounded-xl overflow-hidden ${i===active? 'ring-2 ring-blue-500' : ''}`}>
              <Image src={thumb(images[i])} alt={`Thumb ${i+1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-auto text-sm text-gray-500">Tip: Hover images to zoom on desktop.</div>
      </div>
    </div>
  );
}
