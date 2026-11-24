import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGridSkeleton } from "@/components/ui";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Ürünler" };

type SearchParams = PageProps<"/products">["searchParams"];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="md:w-56 md:shrink-0">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Kategoriler
        </h2>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-zinc-100" />}>
          <CategoryFilter searchParams={searchParams} />
        </Suspense>
      </aside>

      <section className="flex-1">
        <Suspense fallback={<ProductGridSkeleton count={6} />}>
          <ProductResults searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}

async function CategoryFilter({ searchParams }: { searchParams: SearchParams }) {
  const [params, categories] = await Promise.all([searchParams, getCategories()]);
  const active = first(params.category);
  const q = first(params.q);
  const href = (slug?: string) => {
    const query = new URLSearchParams();
    if (slug) query.set("category", slug);
    if (q) query.set("q", q);
    const s = query.toString();
    return s ? `/products?${s}` : "/products";
  };

  const linkClass = (isActive: boolean) =>
    `block rounded-lg px-3 py-2 text-sm transition ${
      isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-zinc-700 hover:bg-zinc-100"
    }`;

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      <Link href={href()} className={linkClass(!active)}>
        Tümü
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={href(c.slug)} className={linkClass(active === c.slug)}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

async function ProductResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categorySlug = first(params.category);
  const query = first(params.q);
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug, query }),
    getCategories(),
  ]);
  const category = categories.find((c) => c.slug === categorySlug);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold">
          {category?.name ?? "Tüm ürünler"}
          {query && <span className="text-zinc-500"> · “{query}”</span>}
        </h1>
        <p className="text-sm text-zinc-500">{products.length} ürün</p>
      </div>
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          Aradığınız kriterlere uygun ürün bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
