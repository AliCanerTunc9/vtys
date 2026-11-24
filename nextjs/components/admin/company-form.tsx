"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { FormError, inputClass, labelClass } from "@/components/ui";
import type { Company, FormState } from "@/lib/types";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function CompanyForm({ action, company }: { action: Action; company?: Company }) {
  const [state, formAction] = useActionState(action, {});
  const value = (key: keyof Company) => state.values?.[key] ?? company?.[key]?.toString() ?? "";

  return (
    <form action={formAction} className="max-w-xl space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
      <div>
        <label htmlFor="ad" className={labelClass}>
          Şirket adı
        </label>
        <input id="ad" name="ad" required maxLength={150} defaultValue={value("ad")} className={inputClass} />
      </div>
      <div>
        <label htmlFor="adres" className={labelClass}>
          Adres
        </label>
        <textarea id="adres" name="adres" rows={2} maxLength={255} defaultValue={value("adres")} className={inputClass} />
      </div>
      <div>
        <label htmlFor="telefonNo" className={labelClass}>
          Telefon
        </label>
        <input
          id="telefonNo"
          name="telefonNo"
          type="tel"
          maxLength={32}
          defaultValue={value("telefonNo")}
          className={inputClass}
        />
      </div>

      <FormError message={state.error} />

      <div className="flex items-center gap-3 border-t border-zinc-100 pt-5">
        <SubmitButton>{company ? "Değişiklikleri kaydet" : "Şirketi ekle"}</SubmitButton>
        <Link href="/admin/companies" className="text-sm text-zinc-600 hover:text-zinc-900">
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
