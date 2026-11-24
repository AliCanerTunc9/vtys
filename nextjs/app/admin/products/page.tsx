import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/ui";
import { getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Ürünler" };

export default function AdminProductsPage() {
  return (
    <>
      <PageHeader
        title="Ürünler"
        description="Ürünleri ekleyin, düzenleyin veya silin"
        action={
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Yeni ürün
          </Link>
        }
      />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <ProductTable />
      </Suspense>
    </>
  );
}

async function ProductTable() {
  const products = await getProducts();
  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
        Henüz ürün yok.
      </p>
    );
  }
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>ID</th>
            <th className={thClass}>Ürün</th>
            <th className={thClass}>Kategori</th>
            <th className={`${thClass} text-right`}>Fiyat</th>
            <th className={`${thClass} text-right`}>Stok</th>
            <th className={`${thClass} text-right`}>İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-zinc-50">
              <td className={`${tdClass} font-mono text-zinc-500`}>{p.id}</td>
              <td className={`${tdClass} font-medium`}>{p.name}</td>
              <td className={`${tdClass} text-zinc-600`}>{p.category?.name ?? "—"}</td>
              <td className={`${tdClass} text-right`}>{formatPrice(p.price)}</td>
              <td className={`${tdClass} text-right`}>
                <span className={p.stock === 0 ? "font-medium text-red-600" : p.stock <= 5 ? "font-medium text-amber-600" : ""}>
                  {p.stock}
                </span>
              </td>
              <td className={`${tdClass} text-right`}>
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/products/${p.id}`} className="text-indigo-600 hover:underline">
                    Düzenle
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
