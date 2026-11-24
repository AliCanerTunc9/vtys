import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { TableSkeleton } from "@/components/ui";
import { updateProduct } from "@/lib/actions";
import { getCategories, getProduct } from "@/lib/data";

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

async function EditProductForm({
  params,
}: {
  params: PageProps<"/admin/products/[id]">["params"];
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(Number(id)),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      action={updateProduct.bind(null, product.id)}
      categories={categories}
      product={product}
    />
  );
}
