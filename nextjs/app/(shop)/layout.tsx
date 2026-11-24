import Form from "next/form";
import Link from "next/link";
import { CartLink } from "@/components/shop/cart-link";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
            VTYS<span className="text-indigo-600">Market</span>
          </Link>
          <nav className="hidden gap-1 text-sm font-medium text-zinc-600 sm:flex">
            <Link href="/" className="rounded-lg px-3 py-2 hover:bg-zinc-100">
              Ana Sayfa
            </Link>
            <Link href="/products" className="rounded-lg px-3 py-2 hover:bg-zinc-100">
              Ürünler
            </Link>
          </nav>
          <Form action="/products" className="ml-auto hidden flex-1 md:block md:max-w-xs">
            <input
              name="q"
              type="search"
              placeholder="Ürün ara…"
              aria-label="Ürün ara"
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white"
            />
          </Form>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <CartLink />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 sm:flex-row sm:justify-between">
          <p>© VTYS Market — Veritabanı Yönetim Sistemleri dersi projesi</p>
          <Link href="/admin" className="hover:text-zinc-800">
            Yönetim Paneli →
          </Link>
        </div>
      </footer>
    </>
  );
}
