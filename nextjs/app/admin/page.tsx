import Link from "next/link";
import { Suspense } from "react";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { StatusBadge, TableSkeleton } from "@/components/ui";
import { getDashboardStats, getOrders } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Genel Bakış" description="Mağazanın güncel durumu" />
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Son siparişler</h2>
            <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline">
              Tümü →
            </Link>
          </div>
          <Suspense fallback={<TableSkeleton />}>
            <RecentOrders />
          </Suspense>
        </section>
        <section>
          <h2 className="mb-3 font-semibold">Stoğu azalan ürünler</h2>
          <Suspense fallback={<TableSkeleton rows={3} />}>
            <LowStock />
          </Suspense>
        </section>
      </div>
    </>
  );
}

async function Stats() {
  const stats = await getDashboardStats();
  const cards = [
    { label: "Toplam ciro", value: formatPrice(stats.revenue), hint: "İptaller hariç" },
    { label: "Sipariş", value: stats.orderCount, hint: `${stats.pendingCount} beklemede` },
    { label: "Müşteri", value: stats.customerCount, hint: "Kayıtlı müşteri" },
    { label: "Ürün", value: stats.productCount, hint: `${stats.lowStock.length} tanesi azalıyor` },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{c.value}</p>
          <p className="mt-1 text-xs text-zinc-400">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
      ))}
    </div>
  );
}

async function RecentOrders() {
  const orders = (await getOrders()).slice(0, 5);
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>No</th>
            <th className={thClass}>Müşteri</th>
            <th className={thClass}>Tarih</th>
            <th className={thClass}>Tutar</th>
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
                {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "—"}
              </td>
              <td className={`${tdClass} text-zinc-500`}>{formatDate(o.createdAt)}</td>
              <td className={tdClass}>{formatPrice(o.total)}</td>
              <td className={tdClass}>
                <StatusBadge status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function LowStock() {
  const { lowStock } = await getDashboardStats();
  if (lowStock.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
        Tüm ürünlerin stoğu yeterli.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
      {lowStock.map((p) => (
        <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <Link href={`/admin/products/${p.id}`} className="hover:text-indigo-600">
            {p.name}
          </Link>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
            }`}
          >
            {p.stock === 0 ? "Tükendi" : `${p.stock} adet`}
          </span>
        </li>
      ))}
    </ul>
  );
}
