"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PhoneListInput } from "@/components/phone-list-input";
import { SubmitButton } from "@/components/submit-button";
import { FormError, inputClass, labelClass } from "@/components/ui";
import { multiValue, type Company, type FormState } from "@/lib/types";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function CompanyForm({ action, company }: { action: Action; company?: Company }) {
  const [state, formAction] = useActionState(action, {});
  const value = (key: "ad" | "adres") => state.values?.[key] ?? company?.[key] ?? "";
  const phones = multiValue(state.values, "telefonlar") ?? company?.telefonlar ?? [];

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
      <PhoneListInput key={phones.join("\n")} initial={phones} />

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
