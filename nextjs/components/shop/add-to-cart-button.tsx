"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  compact = false,
}: {
  product: Pick<Product, "id" | "name" | "price" | "stock">;
  compact?: boolean;
}) {
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return (
      <span className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-500">
        Tükendi
      </span>
    );
  }

  function handleClick() {
    addToCart({ productId: product.id, name: product.name, price: product.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-lg bg-indigo-600 font-medium text-white transition hover:bg-indigo-700 active:scale-95 ${
        compact ? "px-3 py-2 text-sm" : "w-full px-6 py-3"
      }`}
    >
      {added ? "Eklendi ✓" : compact ? "Sepete ekle" : "Sepete Ekle"}
    </button>
  );
}
