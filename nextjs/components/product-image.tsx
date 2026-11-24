// Colored placeholder used until products have real images.

const palettes = [
  "from-indigo-200 to-sky-100 text-indigo-700",
  "from-rose-200 to-orange-100 text-rose-700",
  "from-emerald-200 to-teal-100 text-emerald-700",
  "from-amber-200 to-yellow-100 text-amber-700",
  "from-violet-200 to-fuchsia-100 text-violet-700",
];

export function ProductImage({
  name,
  categoryId,
  className = "",
}: {
  name: string;
  categoryId: number;
  className?: string;
}) {
  const palette = palettes[(categoryId - 1 + palettes.length) % palettes.length];
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center bg-linear-to-br ${palette} ${className}`}
    >
      <span className="text-5xl font-semibold opacity-80">
        {name.charAt(0).toLocaleUpperCase("tr")}
      </span>
    </div>
  );
}
