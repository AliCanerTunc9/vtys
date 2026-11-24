"use client";

import Link from "next/link";
import { removeFromCart, setQuantity, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { shippingFor } from "@/lib/pricing";

export function CartView() {
  const { items, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-500">Sepetiniz boş.</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Ürünlere göz at
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.productId}`}
                className="font-medium hover:text-indigo-600"
              >
                {item.name}
              </Link>
              <p className="text-sm text-zinc-500">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center rounded-lg border border-zinc-300">
              <button
                type="button"
                aria-label="Azalt"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                aria-label="Arttır"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
              >
                +
              </button>
            </div>
            <p className="w-28 text-right font-semibold">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeFromCart(item.productId)}
              className="text-sm text-red-600 hover:underline"
            >
              Kaldır
            </button>
          </li>
        ))}
      </ul>

      <OrderSummary total={total}>
        <Link
          href="/checkout"
          className="mt-4 block rounded-lg bg-indigo-600 px-5 py-3 text-center font-medium text-white hover:bg-indigo-700"
        >
          Siparişi tamamla
        </Link>
      </OrderSummary>
    </div>
  );
}

export function OrderSummary({
  total,
  children,
}: {
  total: number;
  children?: React.ReactNode;
}) {
  const shipping = shippingFor(total);
  return (
    <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 font-semibold">Sipariş özeti</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Ara toplam</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Kargo</dt>
          <dd>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
          <dt>Toplam</dt>
          <dd>{formatPrice(total + shipping)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
