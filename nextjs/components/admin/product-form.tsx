"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { FormError, inputClass, labelClass } from "@/components/ui";
import type { Company, FormState, ProductWithSellers } from "@/lib/types";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ProductForm({
  action,
  companies,
  product,
}: {
  action: Action;
  companies: Company[];
  product?: ProductWithSellers;
}) {
  const [state, formAction] = useActionState(action, {});
  // After a failed submit, show what the user typed instead of the saved values.
  const value = (key: keyof ProductWithSellers) =>
    state.values?.[key] ?? product?.[key]?.toString() ?? "";
  const selectedSellers = new Set(
    state.values
      ? (state.values.saticilar ?? "").split(",").filter(Boolean).map(Number)
      : (product?.saticilar.map((s) => s.sirketNo) ?? []),
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="marka" className={labelClass}>
            Marka
          </label>
          <input id="marka" name="marka" required maxLength={100} defaultValue={value("marka")} className={inputClass} />
        </div>
        <div>
          <label htmlFor="model" className={labelClass}>
            Model
          </label>
          <input id="model" name="model" required maxLength={100} defaultValue={value("model")} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="teknikOzellikler" className={labelClass}>
          Teknik özellikler
        </label>
        <textarea
          id="teknikOzellikler"
          name="teknikOzellikler"
          rows={4}
          defaultValue={value("teknikOzellikler")}
          placeholder="Her satıra bir özellik yazabilirsiniz"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="birimFiyati" className={labelClass}>
            Birim fiyatı (₺)
          </label>
          <input
            id="birimFiyati"
            name="birimFiyati"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={value("birimFiyati")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="stokMiktari" className={labelClass}>
            Stok miktarı
          </label>
          <input
            id="stokMiktari"
            name="stokMiktari"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={value("stokMiktari")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="garantiSuresiAy" className={labelClass}>
            Garanti süresi (ay)
          </label>
          <input
            id="garantiSuresiAy"
            name="garantiSuresiAy"
            type="number"
            step="1"
            min="0"
            max="65535"
            placeholder="Boş bırakılabilir"
            defaultValue={value("garantiSuresiAy")}
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Satıcı şirketler</legend>
        {companies.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Henüz şirket yok.{" "}
            <Link href="/admin/companies/new" className="text-indigo-600 hover:underline">
              Şirket ekleyin
            </Link>
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {companies.map((c) => (
              <label
                key={c.sirketNo}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  name="saticilar"
                  value={c.sirketNo}
                  defaultChecked={selectedSellers.has(c.sirketNo)}
                  className="h-4 w-4 accent-indigo-600"
                />
                {c.ad}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <FormError message={state.error} />

      <div className="flex items-center gap-3 border-t border-zinc-100 pt-5">
        <SubmitButton>{product ? "Değişiklikleri kaydet" : "Ürünü ekle"}</SubmitButton>
        <Link href="/admin/products" className="text-sm text-zinc-600 hover:text-zinc-900">
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
