"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, labelClass } from "@/components/ui";
import type { Category, FormState, Product } from "@/lib/types";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: Action;
  categories: Category[];
  product?: Product;
}) {
  const [state, formAction] = useActionState(action, {});
  // After a failed submit, show what the user typed instead of the saved values.
  const value = (key: keyof Product) => state.values?.[key] ?? product?.[key]?.toString() ?? "";

  return (
    <form action={formAction} className="max-w-2xl space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Ürün adı
        </label>
        <input id="name" name="name" required defaultValue={value("name")} className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Açıklama
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={value("description")}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className={labelClass}>
            Fiyat (₺)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={value("price")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="stock" className={labelClass}>
            Stok
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={value("stock")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Kategori
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={value("categoryId")}
            className={inputClass}
          >
            <option value="" disabled>
              Seçin…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-zinc-100 pt-5">
        <SubmitButton>{product ? "Değişiklikleri kaydet" : "Ürünü ekle"}</SubmitButton>
        <Link href="/admin/products" className="text-sm text-zinc-600 hover:text-zinc-900">
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
