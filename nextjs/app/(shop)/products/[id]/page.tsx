import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductImage } from "@/components/product-image";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { getProduct } from "@/lib/data";
import { formatPrice } from "@/lib/format";

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

async function ProductDetail({
  params,
}: {
  params: PageProps<"/products/[id]">["params"];
}) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductImage
        name={product.name}
        categoryId={product.categoryId}
        className="aspect-square w-full rounded-2xl"
      />
      <div className="flex flex-col gap-4">
        <Link
          href={`/products?category=${product.category?.slug ?? ""}`}
          className="text-sm font-medium uppercase tracking-wide text-indigo-600"
        >
          {product.category?.name}
        </Link>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
        <p className="leading-relaxed text-zinc-600">{product.description}</p>
        <p className="text-sm">
          {product.stock > 0 ? (
            <span className="text-emerald-700">
              Stokta ({product.stock} adet)
            </span>
          ) : (
            <span className="text-red-600">Stokta yok</span>
          )}
        </p>
        <div className="mt-2 max-w-xs">
          <AddToCartButton product={product} />
        </div>
        <ul className="mt-4 space-y-1 border-t border-zinc-200 pt-4 text-sm text-zinc-500">
          <li>✓ 500 TL üzeri ücretsiz kargo</li>
          <li>✓ 14 gün içinde ücretsiz iade</li>
        </ul>
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
