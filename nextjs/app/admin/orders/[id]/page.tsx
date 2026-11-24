import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { cardClass, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { StatusBadge, TableSkeleton } from "@/components/ui";
import { getOrder } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { roundMoney } from "@/lib/pricing";

export const metadata: Metadata = { title: "Sipariş detayı" };

export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-800">
        ← Siparişlere dön
      </Link>
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <OrderDetail params={params} />
      </Suspense>
    </>
  );
}

async function OrderDetail({
  params,
}: {
  params: PageProps<"/admin/orders/[id]">["params"];
}) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) notFound();

  const subtotal = roundMoney(order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0));
  const shipping = roundMoney(order.total - subtotal);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold">
            Sipariş <span className="font-mono">#{order.id}</span>
            <StatusBadge status={order.status} />
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          Durumu değiştir:
          <OrderStatusForm key={order.status} id={order.id} status={order.status} />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className={cardClass}>
          <table className={tableClass}>
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className={thClass}>Ürün</th>
                <th className={`${thClass} text-right`}>Birim fiyat</th>
                <th className={`${thClass} text-right`}>Adet</th>
                <th className={`${thClass} text-right`}>Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className={tdClass}>{item.productName}</td>
                  <td className={`${tdClass} text-right`}>{formatPrice(item.unitPrice)}</td>
                  <td className={`${tdClass} text-right`}>{item.quantity}</td>
                  <td className={`${tdClass} text-right`}>{formatPrice(item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-zinc-200 text-sm">
              <tr>
                <td colSpan={3} className={`${tdClass} text-right text-zinc-500`}>Ara toplam</td>
                <td className={`${tdClass} text-right`}>{formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className={`${tdClass} text-right text-zinc-500`}>Kargo</td>
                <td className={`${tdClass} text-right`}>{shipping > 0 ? formatPrice(shipping) : "Ücretsiz"}</td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={3} className={`${tdClass} text-right`}>Toplam</td>
                <td className={`${tdClass} text-right`}>{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-zinc-200 bg-white p-5 text-sm">
          <div>
            <h2 className="mb-2 font-semibold">Müşteri</h2>
            {order.customer ? (
              <>
                <p>
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-zinc-500">{order.customer.email}</p>
                <p className="text-zinc-500">{order.customer.phone}</p>
              </>
            ) : (
              <p className="text-zinc-500">Müşteri bulunamadı</p>
            )}
          </div>
          <div className="border-t border-zinc-100 pt-4">
            <h2 className="mb-2 font-semibold">Teslimat adresi</h2>
            <p className="text-zinc-600">{order.address}</p>
            <p className="text-zinc-600">{order.city}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
