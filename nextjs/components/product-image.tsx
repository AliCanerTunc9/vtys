// Colored placeholder: the `urun` table has no image column.

const palettes = [
  "from-indigo-200 to-sky-100 text-indigo-700",
  "from-rose-200 to-orange-100 text-rose-700",
  "from-emerald-200 to-teal-100 text-emerald-700",
  "from-amber-200 to-yellow-100 text-amber-700",
  "from-violet-200 to-fuchsia-100 text-violet-700",
];

/** Same brand always gets the same color. */
function paletteFor(marka: string): string {
  let hash = 0;
  for (const ch of marka) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palettes[hash % palettes.length];
}

export function ProductImage({
  marka,
  className = "",
}: {
  marka: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center bg-linear-to-br ${paletteFor(marka)} ${className}`}
    >
      <span className="px-4 text-center text-2xl font-bold tracking-tight opacity-80">
        {marka}
      </span>
    </div>
  );
}
