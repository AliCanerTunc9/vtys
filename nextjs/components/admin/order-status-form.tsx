"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions";
import { statusLabels } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

/** Status dropdown that saves as soon as a new value is picked. */
export function OrderStatusForm({ id, status }: { id: number; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const formData = new FormData();
    formData.set("status", e.target.value);
    startTransition(() => updateOrderStatus(id, formData));
  }

  return (
    <select
      aria-label={`#${id} sipariş durumu`}
      defaultValue={status}
      onChange={handleChange}
      disabled={pending}
      className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabels[s]}
        </option>
      ))}
    </select>
  );
}
