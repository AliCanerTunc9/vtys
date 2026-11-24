import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { TableSkeleton } from "@/components/ui";
import { createProduct } from "@/lib/actions";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = { title: "Yeni ürün" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Yeni ürün" description="Mağazaya yeni bir ürün ekleyin" />
      <Suspense fallback={<TableSkeleton rows={4} />}>
        <NewProductForm />
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  const categories = await getCategories();
  return <ProductForm action={createProduct} categories={categories} />;
}
