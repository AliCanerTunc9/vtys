import type { Metadata } from "next";
import { Suspense } from "react";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/ui";
import { getCustomers } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Müşteriler" };

export default function AdminCustomersPage() {
  return (
    <>
      <PageHeader title="Müşteriler" description="Kayıtlı müşteriler ve alışveriş özetleri" />
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <CustomerTable />
      </Suspense>
    </>
  );
}

async function CustomerTable() {
  const customers = await getCustomers();
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>Ad soyad</th>
            <th className={thClass}>İletişim</th>
            <th className={thClass}>Şehir</th>
            <th className={thClass}>Kayıt tarihi</th>
            <th className={`${thClass} text-right`}>Sipariş</th>
            <th className={`${thClass} text-right`}>Toplam harcama</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-zinc-50">
              <td className={`${tdClass} font-medium`}>
                {c.firstName} {c.lastName}
              </td>
              <td className={tdClass}>
                <p>{c.email}</p>
                <p className="text-xs text-zinc-500">{c.phone}</p>
              </td>
              <td className={tdClass}>{c.city}</td>
              <td className={`${tdClass} text-zinc-500`}>{formatDate(c.createdAt)}</td>
              <td className={`${tdClass} text-right`}>{c.orderCount}</td>
              <td className={`${tdClass} text-right font-medium`}>{formatPrice(c.totalSpent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
