"use client";

import { useState, useTransition } from "react";
import type { FormState } from "@/lib/types";

/** Delete button that asks for confirmation and shows the server's error, if any. */
export function DeleteButton({
  action,
  confirmText,
}: {
  action: () => Promise<FormState>;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function handleClick() {
    if (!confirm(confirmText)) return;
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      setError(result.error);
    });
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Siliniyor…" : "Sil"}
      </button>
      {error && (
        <span role="status" className="mt-1 max-w-56 text-right text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
