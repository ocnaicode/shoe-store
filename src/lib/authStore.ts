"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
};

type AuthStore = {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAdmin: () => get().user?.role === "admin",
    }),
    { name: "hoko-auth" }
  )
);
