import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, AdminNavFallback } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim Paneli" },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 md:flex-row">
      <aside className="flex flex-col gap-4 bg-zinc-900 p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <Link href="/admin" className="px-3 text-lg font-bold text-white">
          VTYS<span className="text-indigo-400">Admin</span>
        </Link>
        {/* usePathname needs a Suspense boundary on routes with dynamic params. */}
        <Suspense fallback={<AdminNavFallback />}>
          <AdminNav />
        </Suspense>
        <Link
          href="/"
          className="mt-auto hidden rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white md:block"
        >
          ← Mağazaya dön
        </Link>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
