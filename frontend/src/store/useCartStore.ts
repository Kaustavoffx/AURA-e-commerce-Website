"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decodeJwt, isTokenExpired } from '../utils/auth';
import { useToastStore } from './useToastStore';

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
  userId: string | null;
  userRole: string | null;
  items: CartItem[];
  totalPrice: string;
  isSidebarOpen: boolean;
  initialized: boolean;
  
  setToken: (token: string | null) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
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
  userId: null,
  userRole: null,
  items: [],
  totalPrice: "0.00",
  isSidebarOpen: false,
  initialized: false,

  setToken: (token) => {
    if (!token || isTokenExpired(token)) {
      set({ token: null, userId: null, userRole: null, items: [], totalPrice: "0.00" });
      return;
    }

    const decoded = decodeJwt(token);
    set({
      token,
      userId: decoded?.sub ?? null,
      userRole: decoded?.role ?? null,
    });

    if (token) {
      get().fetchCart();
    } else {
      set({ items: [], totalPrice: "0.00" });
    }
  },

  logout: () => {
    set({ token: null, userId: null, userRole: null, items: [], totalPrice: "0.00", isSidebarOpen: false });
  },

  initializeAuth: async () => {
    const { initialized, token, setToken } = get();
    if (initialized) return;

    if (token) {
      setToken(token);
    }
    set({ initialized: true });
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
      } else if (res.status === 401) {
        get().logout();
      }
    } catch {
      useToastStore.getState().pushToast("Could not refresh cart", "error");
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const { token } = get();
    if (!token) {
      useToastStore.getState().pushToast("Please login to add items to cart", "info");
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
        useToastStore.getState().pushToast("Added to cart", "success");
      } else if (res.status === 401) {
        get().logout();
      } else {
        useToastStore.getState().pushToast("Failed to add item", "error");
      }
    } catch {
      useToastStore.getState().pushToast("Failed to add item", "error");
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
      const res = await fetch(`${API_BASE}/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (res.status === 401) {
        get().logout();
      }
      await get().fetchCart();
    } catch {
      useToastStore.getState().pushToast("Failed to update quantity", "error");
    }
  },

  removeFromCart: async (productId) => {
    const { token } = get();
    if (!token) return;

    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));

    try {
      const res = await fetch(`${API_BASE}/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        get().logout();
      }
      await get().fetchCart();
    } catch {
      useToastStore.getState().pushToast("Failed to remove item", "error");
    }
  },

  clearCartOptimistic: () => {
    set({ items: [], totalPrice: "0.00" });
  },
}), {
  name: "ecommerce-cart-storage",
  partialize: (state) => ({ token: state.token }),
}));
