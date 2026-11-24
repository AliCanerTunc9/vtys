import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/ui";
import { getOrders } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Siparişler" };

export default function AdminOrdersPage() {
  return (
    <>
      <PageHeader title="Siparişler" description="Siparişleri görüntüleyin ve durumlarını güncelleyin" />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <OrderTable />
      </Suspense>
    </>
  );
}

async function OrderTable() {
  const orders = await getOrders();
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
        Henüz sipariş yok.
      </p>
    );
  }
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>No</th>
            <th className={thClass}>Müşteri</th>
            <th className={thClass}>Tarih</th>
            <th className={`${thClass} text-right`}>Ürün</th>
            <th className={`${thClass} text-right`}>Tutar</th>
            <th className={thClass}>Durum</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-zinc-50">
              <td className={tdClass}>
                <Link href={`/admin/orders/${o.id}`} className="font-mono text-indigo-600 hover:underline">
                  #{o.id}
                </Link>
              </td>
              <td className={tdClass}>
                {o.customer ? (
                  <>
                    <p className="font-medium">
                      {o.customer.firstName} {o.customer.lastName}
                    </p>
                    <p className="text-xs text-zinc-500">{o.city}</p>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className={`${tdClass} text-zinc-500`}>{formatDate(o.createdAt)}</td>
              <td className={`${tdClass} text-right`}>
                {o.items.reduce((sum, i) => sum + i.quantity, 0)}
              </td>
              <td className={`${tdClass} text-right font-medium`}>{formatPrice(o.total)}</td>
              <td className={tdClass}>
                <OrderStatusForm key={o.status} id={o.id} status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
