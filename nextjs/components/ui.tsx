import { statusLabels, statusStyles } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-8 animate-pulse rounded bg-zinc-100" />
      ))}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export const labelClass = "mb-1 block text-sm font-medium text-zinc-700";
