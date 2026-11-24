import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center">
      <p className="font-mono text-sm text-indigo-600">404</p>
      <h1 className="text-2xl font-semibold">Sayfa bulunamadı</h1>
      <p className="text-zinc-500">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>
      <Link href="/" className="mt-2 font-medium text-indigo-600 hover:underline">
        Ana sayfaya dön →
      </Link>
    </div>
  );
}
