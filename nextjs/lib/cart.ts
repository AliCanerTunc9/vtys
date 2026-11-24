"use client";

import { useSyncExternalStore } from "react";

// Shopping cart kept in the browser's localStorage. The prices stored here
// are only for display; the server reads prices again when the order is placed.
//
// satin_alir has no quantity column, so the cart holds at most one of each
// product.

export type CartItem = {
  urunNo: number;
  name: string;
  price: number;
};

const STORAGE_KEY = "vtys-cart-v2";
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

export function addToCart(item: CartItem) {
  load();
  if (items.some((i) => i.urunNo === item.urunNo)) return;
  save([...items, item]);
}

export function removeFromCart(urunNo: number) {
  load();
  save(items.filter((i) => i.urunNo !== urunNo));
}

export function clearCart() {
  save(EMPTY);
}

export function useCart() {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const total = cartItems.reduce((sum, i) => sum + i.price, 0);
  return { items: cartItems, count: cartItems.length, total };
}
