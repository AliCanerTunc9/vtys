import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { EmptyState, ProductGridSkeleton } from "@/components/ui";
import { getBrands, getCompanies, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Ürünler" };

type SearchParams = PageProps<"/products">["searchParams"];
type Filters = { marka?: string; satici?: string; q?: string };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function readFilters(searchParams: SearchParams): Promise<Filters> {
  const params = await searchParams;
  return { marka: first(params.marka), satici: first(params.satici), q: first(params.q) };
}

/** Link to the list with one filter changed and the others kept. */
function filterHref(current: Filters, change: Partial<Filters>): string {
  const next = { ...current, ...change };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) if (value) query.set(key, value);
  const s = query.toString();
  return s ? `/products?${s}` : "/products";
}

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="space-y-6 md:w-56 md:shrink-0">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-zinc-100" />}>
          <FilterPanel searchParams={searchParams} />
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

const linkClass = (isActive: boolean) =>
  `block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
    isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-zinc-700 hover:bg-zinc-100"
  }`;

async function FilterPanel({ searchParams }: { searchParams: SearchParams }) {
  const [filters, brands, companies] = await Promise.all([
    readFilters(searchParams),
    getBrands(),
    getCompanies(),
  ]);

  return (
    <>
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Marka</h2>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          <Link href={filterHref(filters, { marka: undefined })} className={linkClass(!filters.marka)}>
            Tümü
          </Link>
          {brands.map((marka) => (
            <Link key={marka} href={filterHref(filters, { marka })} className={linkClass(filters.marka === marka)}>
              {marka}
            </Link>
          ))}
        </nav>
      </div>
      {companies.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Satıcı</h2>
          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            <Link href={filterHref(filters, { satici: undefined })} className={linkClass(!filters.satici)}>
              Tümü
            </Link>
            {companies.map((c) => (
              <Link
                key={c.sirketNo}
                href={filterHref(filters, { satici: String(c.sirketNo) })}
                className={linkClass(filters.satici === String(c.sirketNo))}
              >
                {c.ad}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

async function ProductResults({ searchParams }: { searchParams: SearchParams }) {
  const filters = await readFilters(searchParams);
  const sirketNo = Number(filters.satici) || undefined;
  const [products, companies] = await Promise.all([
    getProducts({ marka: filters.marka, sirketNo, query: filters.q }),
    getCompanies(),
  ]);
  const seller = companies.find((c) => c.sirketNo === sirketNo);
  const title = [filters.marka, seller && `${seller.ad} satıcısından`].filter(Boolean).join(" · ");

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold">
          {title || "Tüm ürünler"}
          {filters.q && <span className="text-zinc-500"> · “{filters.q}”</span>}
        </h1>
        <p className="text-sm text-zinc-500">{products.length} ürün</p>
      </div>
      {products.length === 0 ? (
        <EmptyState>Aradığınız kriterlere uygun ürün bulunamadı.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.urunNo} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
