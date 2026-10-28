import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  size: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  add: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, size, qty) =>
        set((state) => {
          const next = [...state.lines];
          const found = next.find((line) => line.productId === productId && line.size === size);
          if (found) found.qty += qty;
          else next.push({ productId, size, qty });
          return { lines: next };
        }),
      remove: (productId, size) =>
        set((state) => ({
          lines: state.lines.filter((line) => !(line.productId === productId && line.size === size)),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "alpha-store-cart" },
  ),
);
