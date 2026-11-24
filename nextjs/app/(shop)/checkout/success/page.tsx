import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "./clear-cart";

export const metadata: Metadata = { title: "Sipariş alındı" };

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-10 text-center">
      <ClearCart />
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
        ✓
      </div>
      <h1 className="text-2xl font-semibold">Siparişiniz alındı!</h1>
      <Suspense fallback={<p className="mt-2 text-zinc-500">&nbsp;</p>}>
        <OrderNumber searchParams={searchParams} />
      </Suspense>
      <p className="mt-2 text-zinc-500">
        Siparişiniz hazırlandığında e-posta ile bilgilendirileceksiniz.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Alışverişe devam et
      </Link>
    </div>
  );
}

async function OrderNumber({
  searchParams,
}: {
  searchParams: PageProps<"/checkout/success">["searchParams"];
}) {
  const { order } = await searchParams;
  if (!order) return null;
  return (
    <p className="mt-2 text-zinc-600">
      Sipariş numaranız: <span className="font-mono font-semibold">#{String(order)}</span>
    </p>
  );
}
