import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { EmptyState, ProductGridSkeleton } from "@/components/ui";
import { getBrands, getProducts } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 px-8 py-14 text-white">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-200">
          Yeni sezon
        </p>
        <h1 className="mt-2 max-w-xl text-4xl font-bold leading-tight">
          İhtiyacın olan her şey tek bir yerde.
        </h1>
        <p className="mt-3 max-w-lg text-indigo-100">
          Güvenilir satıcılardan, garantili ürünler uygun fiyatlarla.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-medium text-indigo-700 transition hover:bg-indigo-50"
        >
          Alışverişe başla
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Markalar</h2>
        <Suspense fallback={<div className="h-11 animate-pulse rounded-lg bg-zinc-100" />}>
          <BrandLinks />
        </Suspense>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Yeni gelenler</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
            Tümünü gör →
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <NewestProducts />
        </Suspense>
      </section>
    </div>
  );
}

async function BrandLinks() {
  const brands = await getBrands();
  if (brands.length === 0) return <p className="text-sm text-zinc-500">Henüz marka yok.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {brands.map((marka) => (
        <Link
          key={marka}
          href={`/products?marka=${encodeURIComponent(marka)}`}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-700"
        >
          {marka}
        </Link>
      ))}
    </div>
  );
}

async function NewestProducts() {
  const products = await getProducts({ limit: 8 });
  if (products.length === 0) {
    return <EmptyState>Henüz satışta ürün yok.</EmptyState>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.urunNo} product={p} />
      ))}
    </div>
  );
}
