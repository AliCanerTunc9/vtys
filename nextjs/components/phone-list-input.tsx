"use client";

import { useState } from "react";
import { inputClass, labelClass } from "@/components/ui";
import { MAX_PHONES } from "@/lib/validation";

/**
 * A list of phone inputs, all named "telefonlar", so the form sends every
 * number (sirket_telefon / musteri_telefon). Rows can be added and removed.
 *
 * To refill after a failed submit, give it a `key` that changes with the
 * submitted values so it remounts with them.
 */
export function PhoneListInput({
  initial,
  required = false,
  label = "Telefon numaraları",
}: {
  initial: string[];
  required?: boolean;
  label?: string;
}) {
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : [""]).map((value, i) => ({ id: `r${i}`, value })),
  );

  function addRow() {
    setRows((r) => [...r, { id: crypto.randomUUID(), value: "" }]);
  }

  function removeRow(id: string) {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : [{ id: crypto.randomUUID(), value: "" }]));
  }

  return (
    <fieldset>
      <legend className={labelClass}>
        {label}
        {!required && <span className="font-normal text-zinc-400"> (isteğe bağlı)</span>}
      </legend>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={row.id} className="flex gap-2">
            <input
              name="telefonlar"
              type="tel"
              inputMode="tel"
              maxLength={32}
              defaultValue={row.value}
              required={required && i === 0}
              aria-label={`${i + 1}. telefon numarası`}
              placeholder="0532 123 45 67"
              className={inputClass}
            />
            {(rows.length > 1 || !required) && (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label={`${i + 1}. telefon numarasını kaldır`}
                className="shrink-0 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-500 hover:bg-zinc-50 hover:text-red-600"
              >
                Kaldır
              </button>
            )}
          </div>
        ))}
      </div>
      {rows.length < MAX_PHONES && (
        <button
          type="button"
          onClick={addRow}
          className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
        >
          + Telefon ekle
        </button>
      )}
    </fieldset>
  );
}
