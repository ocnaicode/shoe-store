"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: number;
  color?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  wishlist: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: number) => void;
  updateQuantity: (id: string, size: number, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  total: () => number;
  count: () => number;
};

export const useStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      addToCart: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id && i.size === item.size);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeFromCart: (id, size) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.size === size)),
        })),
      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id && i.size === size ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((w) => w !== id)
            : [...state.wishlist, id],
        })),
      total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: "hoko-storage" }
  )
);
