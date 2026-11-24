import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.urunNo}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md">
      <Link href={href} className="block overflow-hidden">
        <ProductImage
          marka={product.marka}
          className="aspect-[4/3] w-full transition group-hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {product.marka}
        </p>
        <Link href={href} className="font-medium text-zinc-900 hover:text-indigo-600">
          {product.model}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-lg font-semibold text-zinc-900">
            {formatPrice(product.birimFiyati)}
          </span>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
