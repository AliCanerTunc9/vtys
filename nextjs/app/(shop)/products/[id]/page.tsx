import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductImage } from "@/components/product-image";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { getProduct } from "@/lib/data";
import { formatPrice, formatWarranty } from "@/lib/format";

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div className="space-y-6">
      <Link href="/products" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← Ürünlere dön
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/products/[id]">["params"] }) {
  const { id } = await params;
  const urunNo = Number(id);
  const product = Number.isInteger(urunNo) && urunNo > 0 ? await getProduct(urunNo) : undefined;
  if (!product) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductImage marka={product.marka} className="aspect-square w-full rounded-2xl" />
      <div className="flex flex-col gap-4">
        <Link
          href={`/products?marka=${encodeURIComponent(product.marka)}`}
          className="text-sm font-medium uppercase tracking-wide text-indigo-600"
        >
          {product.marka}
        </Link>
        <h1 className="text-3xl font-bold">{product.model}</h1>
        <p className="text-3xl font-semibold">{formatPrice(product.birimFiyati)}</p>

        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
          <div>
            <dt className="text-zinc-500">Stok</dt>
            <dd className={product.stokMiktari > 0 ? "font-medium text-emerald-700" : "font-medium text-red-600"}>
              {product.stokMiktari > 0 ? `${product.stokMiktari} adet` : "Stokta yok"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Garanti</dt>
            <dd className="font-medium">{formatWarranty(product.garantiSuresiAy)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-zinc-500">Satıcılar</dt>
            <dd className="font-medium">
              {product.saticilar.length ? product.saticilar.map((s) => s.ad).join(", ") : "—"}
            </dd>
          </div>
        </dl>

        <div className="max-w-xs">
          <AddToCartButton product={product} />
        </div>

        {product.teknikOzellikler && (
          <section className="border-t border-zinc-200 pt-4">
            <h2 className="mb-2 font-semibold">Teknik özellikler</h2>
            <p className="whitespace-pre-line leading-relaxed text-zinc-600">
              {product.teknikOzellikler}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-zinc-100" />
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
        <div className="h-9 w-2/3 animate-pulse rounded bg-zinc-100" />
        <div className="h-9 w-1/3 animate-pulse rounded bg-zinc-100" />
        <div className="h-24 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}
