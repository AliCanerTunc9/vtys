import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteButton } from "@/components/admin/delete-button";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { EmptyState, TableSkeleton } from "@/components/ui";
import { deleteProduct } from "@/lib/actions";
import { getProducts } from "@/lib/data";
import { formatPrice, formatWarranty } from "@/lib/format";

export const metadata: Metadata = { title: "Ürünler" };

export default function AdminProductsPage() {
  return (
    <>
      <PageHeader
        title="Ürünler"
        description="urun tablosu: ürünleri ekleyin, düzenleyin veya silin"
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
  if (products.length === 0) return <EmptyState>Henüz ürün yok.</EmptyState>;
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>No</th>
            <th className={thClass}>Marka</th>
            <th className={thClass}>Model</th>
            <th className={`${thClass} text-right`}>Birim fiyatı</th>
            <th className={`${thClass} text-right`}>Stok</th>
            <th className={thClass}>Garanti</th>
            <th className={`${thClass} text-right`}>İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {products.map((p) => (
            <tr key={p.urunNo} className="hover:bg-zinc-50">
              <td className={`${tdClass} font-mono text-zinc-500`}>{p.urunNo}</td>
              <td className={`${tdClass} font-medium`}>{p.marka}</td>
              <td className={tdClass}>{p.model}</td>
              <td className={`${tdClass} text-right`}>{formatPrice(p.birimFiyati)}</td>
              <td className={`${tdClass} text-right`}>
                <span
                  className={
                    p.stokMiktari === 0
                      ? "font-medium text-red-600"
                      : p.stokMiktari <= 5
                        ? "font-medium text-amber-600"
                        : ""
                  }
                >
                  {p.stokMiktari}
                </span>
              </td>
              <td className={`${tdClass} text-zinc-600`}>{formatWarranty(p.garantiSuresiAy)}</td>
              <td className={`${tdClass} text-right`}>
                <div className="flex items-start justify-end gap-3">
                  <Link href={`/admin/products/${p.urunNo}`} className="text-indigo-600 hover:underline">
                    Düzenle
                  </Link>
                  <DeleteButton
                    action={deleteProduct.bind(null, p.urunNo)}
                    confirmText={`"${p.marka} ${p.model}" silinsin mi?`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
