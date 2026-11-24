"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/lib/actions";

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`"${name}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    startTransition(() => deleteProduct(id));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Siliniyor…" : "Sil"}
    </button>
  );
}
