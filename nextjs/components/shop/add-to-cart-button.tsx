"use client";

import Link from "next/link";
import { addToCart, useCart } from "@/lib/cart";
import { productName, type Product } from "@/lib/types";

export function AddToCartButton({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const { items } = useCart();
  const size = compact ? "px-3 py-2 text-sm" : "w-full px-6 py-3";

  if (product.stokMiktari <= 0) {
    return (
      <span className={`rounded-lg bg-zinc-100 text-center font-medium text-zinc-500 ${size}`}>
        Tükendi
      </span>
    );
  }

  // One of each product per purchase (satin_alir has no quantity column).
  if (items.some((i) => i.urunNo === product.urunNo)) {
    return (
      <Link
        href="/cart"
        className={`rounded-lg bg-emerald-50 text-center font-medium text-emerald-700 hover:bg-emerald-100 ${size}`}
      >
        Sepette ✓
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        addToCart({ urunNo: product.urunNo, name: productName(product), price: product.birimFiyati })
      }
      className={`rounded-lg bg-indigo-600 font-medium text-white transition hover:bg-indigo-700 active:scale-95 ${size}`}
    >
      Sepete ekle
    </button>
  );
}
