"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { Plus } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("http://localhost:3000/api/v1/products?limit=20");
        const json = await res.json();
        if (json.success) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tighter mb-6">
          The Aura Collection
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl font-medium">
          Discover our curated selection of premium electronics, apparel, and home essentials designed to elevate your everyday life.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-5">
              <div className="bg-gray-200 aspect-[4/5] rounded-3xl w-full"></div>
              <div className="space-y-3 px-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col gap-5">
              <div className="relative bg-white aspect-[4/5] rounded-3xl overflow-hidden shadow-sm shadow-black/5 ring-1 ring-gray-100 group-hover:shadow-2xl group-hover:shadow-black/10 transition-all duration-500">
                {/* Mock image placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300 font-extrabold text-6xl select-none">
                  {product.name.charAt(0)}
                </div>
                
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-black/90 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-black transition-colors shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
              
              <div className="px-2">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 truncate" title={product.name}>
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">${product.price}</span>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      Only {product.stock} left
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
