import type { Metadata } from "next";
import { Suspense } from "react";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { PhoneList } from "@/components/phone-list";
import { EmptyState, TableSkeleton } from "@/components/ui";
import { getCustomers } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Müşteriler" };

export default function AdminCustomersPage() {
  return (
    <>
      <PageHeader title="Müşteriler" description="musteri tablosu: müşteriler ve alışveriş özetleri" />
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <CustomerTable />
      </Suspense>
    </>
  );
}

async function CustomerTable() {
  const customers = await getCustomers();
  if (customers.length === 0) return <EmptyState>Henüz müşteri yok.</EmptyState>;
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>Kimlik no</th>
            <th className={thClass}>Ad</th>
            <th className={thClass}>Telefon</th>
            <th className={thClass}>Adres</th>
            <th className={`${thClass} text-right`}>Fatura</th>
            <th className={`${thClass} text-right`}>Ürün</th>
            <th className={`${thClass} text-right`}>Toplam harcama</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {customers.map((c) => (
            <tr key={c.kimlikNo} className="hover:bg-zinc-50">
              <td className={`${tdClass} font-mono text-zinc-500`}>{c.kimlikNo}</td>
              <td className={`${tdClass} font-medium`}>{c.ad}</td>
              <td className={tdClass}>
                <PhoneList phones={c.telefonlar} />
              </td>
              <td className={`${tdClass} text-zinc-600`}>{c.adres ?? "—"}</td>
              <td className={`${tdClass} text-right`}>{c.faturaSayisi}</td>
              <td className={`${tdClass} text-right`}>{c.urunSayisi}</td>
              <td className={`${tdClass} text-right font-medium`}>{formatPrice(c.toplamHarcama)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
