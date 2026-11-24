"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { FormError, inputClass, labelClass } from "@/components/ui";
import { placeOrder } from "@/lib/actions";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { OrderSummary } from "../cart/cart-view";

export function CheckoutForm() {
  const { items, total } = useCart();
  const [state, formAction] = useActionState<FormState, FormData>(placeOrder, {});
  const value = (key: string) => state.values?.[key];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-500">Sepetiniz boş, sipariş verebilmek için ürün ekleyin.</p>
        <Link href="/products" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
          Ürünlere göz at →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Müşteri bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="kimlikNo" className={labelClass}>
              T.C. kimlik no
            </label>
            <input
              id="kimlikNo"
              name="kimlikNo"
              inputMode="numeric"
              pattern="\d{11}"
              maxLength={11}
              title="11 haneli T.C. kimlik numarası"
              required
              defaultValue={value("kimlikNo")}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ad" className={labelClass}>
              Ad soyad
            </label>
            <input
              id="ad"
              name="ad"
              autoComplete="name"
              maxLength={150}
              required
              defaultValue={value("ad")}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="telefonNo" className={labelClass}>
              Telefon
            </label>
            <input
              id="telefonNo"
              name="telefonNo"
              type="tel"
              autoComplete="tel"
              maxLength={32}
              required
              defaultValue={value("telefonNo")}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="adres" className={labelClass}>
              Adres
            </label>
            <textarea
              id="adres"
              name="adres"
              rows={3}
              maxLength={255}
              autoComplete="street-address"
              required
              defaultValue={value("adres")}
              className={inputClass}
            />
          </div>
        </div>
        <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">
          Daha önce alışveriş yaptıysanız bilgileriniz kimlik numaranıza göre güncellenir. Bu bir
          ders projesidir, gerçek ödeme alınmaz.
        </p>
      </div>

      <OrderSummary total={total} count={items.length}>
        <ul className="mt-4 space-y-1 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
          {items.map((i) => (
            <li key={i.urunNo} className="flex justify-between gap-2">
              <span className="truncate">{i.name}</span>
              <span>{formatPrice(i.price)}</span>
            </li>
          ))}
        </ul>
        <input type="hidden" name="items" value={JSON.stringify(items.map((i) => i.urunNo))} />
        <div className="mt-4">
          <FormError message={state.error} />
        </div>
        <SubmitButton pendingText="Sipariş veriliyor…" className="mt-4 w-full py-3 text-base">
          Siparişi onayla
        </SubmitButton>
      </OrderSummary>
    </form>
  );
}
