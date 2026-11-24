import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cardClass, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/ui";
import { getInvoice } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Fatura detayı" };

export default function AdminInvoicePage({ params }: PageProps<"/admin/invoices/[id]">) {
  return (
    <>
      <Link href="/admin/invoices" className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-800">
        ← Faturalara dön
      </Link>
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <InvoiceDetail params={params} />
      </Suspense>
    </>
  );
}

async function InvoiceDetail({ params }: { params: PageProps<"/admin/invoices/[id]">["params"] }) {
  const { id } = await params;
  const faturaNo = Number(id);
  const invoice = Number.isInteger(faturaNo) && faturaNo > 0 ? await getInvoice(faturaNo) : undefined;
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Fatura <span className="font-mono">#{invoice.faturaNo}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{formatDate(invoice.tarih)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className={cardClass}>
          <table className={tableClass}>
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className={thClass}>Ürün no</th>
                <th className={thClass}>Marka</th>
                <th className={thClass}>Model</th>
                <th className={`${thClass} text-right`}>Güncel fiyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoice.urunler.map((p) => (
                <tr key={p.urunNo}>
                  <td className={`${tdClass} font-mono text-zinc-500`}>{p.urunNo}</td>
                  <td className={tdClass}>{p.marka}</td>
                  <td className={tdClass}>
                    <Link href={`/admin/products/${p.urunNo}`} className="hover:text-indigo-600">
                      {p.model}
                    </Link>
                  </td>
                  <td className={`${tdClass} text-right`}>{formatPrice(p.birimFiyati)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-zinc-200">
              <tr className="font-semibold">
                <td colSpan={3} className={`${tdClass} text-right`}>
                  Fatura tutarı
                </td>
                <td className={`${tdClass} text-right`}>{formatPrice(invoice.tutar)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
            satin_alir tablosu satış anındaki fiyatı saklamadığı için ürünlerin güncel fiyatı
            gösterilir. Fatura tutarı satış anındaki toplamdır.
          </p>
        </div>

        <aside className="h-fit space-y-2 rounded-xl border border-zinc-200 bg-white p-5 text-sm">
          <h2 className="mb-2 font-semibold">Müşteri</h2>
          {invoice.musteri ? (
            <>
              <p className="font-medium">{invoice.musteri.ad}</p>
              <p className="font-mono text-zinc-500">{invoice.musteri.kimlikNo}</p>
              <p className="text-zinc-500">{invoice.musteri.telefonNo ?? "—"}</p>
              <p className="text-zinc-600">{invoice.musteri.adres ?? "—"}</p>
            </>
          ) : (
            <p className="text-zinc-500">Bu faturaya bağlı müşteri yok.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
