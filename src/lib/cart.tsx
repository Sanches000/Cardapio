import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  size?: { name: string; price: number } | null;
  addons: { name: string; price: number }[];
  notes?: string;
  imageUrl?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cdp_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const count = items.reduce((acc, i) => acc + i.quantity, 0);
    return {
      items,
      subtotal,
      count,
      add: (item) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.key === item.key);
          if (existing) {
            return prev.map((p) =>
              p.key === item.key ? { ...p, quantity: p.quantity + item.quantity } : p,
            );
          }
          return [...prev, item];
        }),
      remove: (key) => setItems((prev) => prev.filter((p) => p.key !== key)),
      setQty: (key, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.key !== key)
            : prev.map((p) => (p.key === key ? { ...p, quantity: qty } : p)),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}