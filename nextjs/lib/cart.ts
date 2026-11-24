"use client";

import { useSyncExternalStore } from "react";

// Shopping cart kept in the browser's localStorage. The prices stored here
// are only for display; the server reads prices again when the order is placed.

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

const STORAGE_KEY = "vtys-cart";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    items = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    items = EMPTY;
  }
}

function save(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode etc.); keep the cart in memory.
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  loaded = false;
  load();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return items;
}

function getServerSnapshot() {
  return EMPTY;
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  load();
  const existing = items.find((i) => i.productId === item.productId);
  save(
    existing
      ? items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...items, { ...item, quantity }],
  );
}

export function setQuantity(productId: number, quantity: number) {
  load();
  save(
    quantity <= 0
      ? items.filter((i) => i.productId !== productId)
      : items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
  );
}

export function removeFromCart(productId: number) {
  setQuantity(productId, 0);
}

export function clearCart() {
  save(EMPTY);
}

export function useCart() {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items: cartItems, count, total };
}
