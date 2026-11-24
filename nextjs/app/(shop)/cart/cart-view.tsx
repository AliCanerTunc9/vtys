"use client";

import Link from "next/link";
import { removeFromCart, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

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
      <div>
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {items.map((item) => (
            <li key={item.urunNo} className="flex flex-wrap items-center gap-4 p-4">
              <Link href={`/products/${item.urunNo}`} className="min-w-0 flex-1 font-medium hover:text-indigo-600">
                {item.name}
              </Link>
              <p className="font-semibold">{formatPrice(item.price)}</p>
              <button
                type="button"
                onClick={() => removeFromCart(item.urunNo)}
                className="text-sm text-red-600 hover:underline"
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-zinc-500">Her üründen bir adet satın alınabilir.</p>
      </div>

      <OrderSummary total={total} count={items.length}>
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
  count,
  children,
}: {
  total: number;
  count: number;
  children?: React.ReactNode;
}) {
  return (
    <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 font-semibold">Sipariş özeti</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Ürün sayısı</dt>
          <dd>{count}</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
          <dt>Fatura tutarı</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
