import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { TableSkeleton } from "@/components/ui";
import { updateProduct } from "@/lib/actions";
import { getCompanies, getProduct } from "@/lib/data";

export const metadata: Metadata = { title: "Ürünü düzenle" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <>
      <PageHeader title="Ürünü düzenle" />
      <Suspense fallback={<TableSkeleton rows={4} />}>
        <EditProductForm params={params} />
      </Suspense>
    </>
  );
}

async function EditProductForm({ params }: { params: PageProps<"/admin/products/[id]">["params"] }) {
  const { id } = await params;
  const urunNo = Number(id);
  const [product, companies] = await Promise.all([
    Number.isInteger(urunNo) && urunNo > 0 ? getProduct(urunNo) : undefined,
    getCompanies(),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      action={updateProduct.bind(null, product.urunNo)}
      companies={companies}
      product={product}
    />
  );
}
