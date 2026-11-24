import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { EmptyState, TableSkeleton } from "@/components/ui";
import { getInvoices } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Faturalar" };

export default function AdminInvoicesPage() {
  return (
    <>
      <PageHeader
        title="Faturalar"
        description="fatura ve satin_alir tabloları: her sipariş bir fatura oluşturur"
      />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <InvoiceTable />
      </Suspense>
    </>
  );
}

async function InvoiceTable() {
  const invoices = await getInvoices();
  if (invoices.length === 0) return <EmptyState>Henüz fatura yok.</EmptyState>;
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>Fatura no</th>
            <th className={thClass}>Müşteri</th>
            <th className={thClass}>Tarih</th>
            <th className={`${thClass} text-right`}>Ürün</th>
            <th className={`${thClass} text-right`}>Tutar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {invoices.map((f) => (
            <tr key={f.faturaNo} className="hover:bg-zinc-50">
              <td className={tdClass}>
                <Link href={`/admin/invoices/${f.faturaNo}`} className="font-mono text-indigo-600 hover:underline">
                  #{f.faturaNo}
                </Link>
              </td>
              <td className={tdClass}>
                {f.musteriAd ? (
                  <>
                    <p className="font-medium">{f.musteriAd}</p>
                    <p className="font-mono text-xs text-zinc-500">{f.kimlikNo}</p>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className={`${tdClass} text-zinc-500`}>{formatDate(f.tarih)}</td>
              <td className={`${tdClass} text-right`}>{f.urunSayisi}</td>
              <td className={`${tdClass} text-right font-medium`}>{formatPrice(f.tutar)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
