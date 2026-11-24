"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, labelClass } from "@/components/ui";
import { placeOrder } from "@/lib/actions";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { OrderSummary } from "../cart/cart-view";

const fields = [
  { name: "firstName", label: "Ad", autoComplete: "given-name" },
  { name: "lastName", label: "Soyad", autoComplete: "family-name" },
  { name: "email", label: "E-posta", type: "email", autoComplete: "email" },
  { name: "phone", label: "Telefon", type: "tel", autoComplete: "tel" },
  { name: "city", label: "Şehir", autoComplete: "address-level1" },
] as const;

export function CheckoutForm() {
  const { items, total } = useCart();
  const [state, formAction] = useActionState<FormState, FormData>(placeOrder, {});

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

  const cartPayload = JSON.stringify(
    items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  );

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Teslimat bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name}>
              <label htmlFor={f.name} className={labelClass}>
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={"type" in f ? f.type : "text"}
                autoComplete={f.autoComplete}
                defaultValue={state.values?.[f.name]}
                required
                className={inputClass}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label htmlFor="address" className={labelClass}>
              Adres
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              required
              autoComplete="street-address"
              defaultValue={state.values?.address}
              className={inputClass}
            />
          </div>
        </div>
        <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">
          Ödeme kapıda yapılacaktır. Bu bir ders projesidir, gerçek ödeme alınmaz.
        </p>
      </div>

      <OrderSummary total={total}>
        <ul className="mt-4 space-y-1 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="truncate">
                {i.quantity} × {i.name}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <input type="hidden" name="items" value={cartPayload} />
        {state.error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <SubmitButton pendingText="Sipariş veriliyor…" className="mt-4 w-full py-3 text-base">
          Siparişi onayla
        </SubmitButton>
      </OrderSummary>
    </form>
  );
}
