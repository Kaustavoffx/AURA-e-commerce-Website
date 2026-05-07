"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../store/useCartStore";
import { useHydration } from "./useHydration";

export function useRequireAuth(requiredRole?: string) {
  const router = useRouter();
  const isHydrated = useHydration();
  const { token, userRole, initialized, initializeAuth } = useCartStore();

  const isAuthed = Boolean(token);
  const hasRole = requiredRole ? userRole === requiredRole : true;

  useEffect(() => {
    if (!isHydrated) return;
    void initializeAuth();
  }, [isHydrated, initializeAuth]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!initialized) return;
    if (!isAuthed) {
      router.replace("/login");
      return;
    }
    if (!hasRole) {
      router.replace("/");
    }
  }, [isHydrated, initialized, isAuthed, hasRole, router]);

  return {
    isHydrated,
    initialized,
    isAuthed,
    hasRole,
    ready: isHydrated && initialized && isAuthed && hasRole,
  };
}
