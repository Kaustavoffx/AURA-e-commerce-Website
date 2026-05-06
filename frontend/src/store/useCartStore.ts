"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  sku: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: string;
  inStock: boolean;
}

interface CartState {
  token: string | null;
  items: CartItem[];
  totalPrice: string;
  isSidebarOpen: boolean;
  
  setToken: (token: string | null) => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCartOptimistic: () => void;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

export const useCartStore = create<CartState>()(persist((set, get) => ({
  token: null,
  items: [],
  totalPrice: "0.00",
  isSidebarOpen: false,

  setToken: (token) => {
    set({ token });
    if (token) {
      get().fetchCart();
    } else {
      set({ items: [], totalPrice: "0.00" });
    }
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  fetchCart: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        set({ items: json.data.items, totalPrice: json.data.totalPrice });
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const { token } = get();
    if (!token) {
      alert("Please login first to add items to cart.");
      return;
    }

    set({ isSidebarOpen: true });

    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.ok) {
        await get().fetchCart();
      }
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  },

  updateQuantity: async (productId, quantity) => {
    const { token } = get();
    if (!token) return;

    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));

    try {
      await fetch(`${API_BASE}/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      await get().fetchCart();
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  },

  removeFromCart: async (productId) => {
    const { token } = get();
    if (!token) return;

    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));

    try {
      await fetch(`${API_BASE}/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchCart();
    } catch (error) {
      console.error("Failed to remove from cart", error);
    }
  },

  clearCartOptimistic: () => {
    set({ items: [], totalPrice: "0.00" });
  },
}), {
  name: "ecommerce-cart-storage",
  partialize: (state) => ({ token: state.token }),
}));
