export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const tableClass = "w-full text-left text-sm";
export const thClass = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500";
export const tdClass = "px-4 py-3";
export const cardClass = "overflow-x-auto rounded-xl border border-zinc-200 bg-white";
