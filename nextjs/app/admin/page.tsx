import Link from "next/link";
import { Suspense } from "react";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { EmptyState, TableSkeleton } from "@/components/ui";
import { getDashboardStats, getInvoices } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { productName } from "@/lib/types";

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
            <h2 className="font-semibold">Son faturalar</h2>
            <Link href="/admin/invoices" className="text-sm text-indigo-600 hover:underline">
              Tümü →
            </Link>
          </div>
          <Suspense fallback={<TableSkeleton />}>
            <RecentInvoices />
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
    { label: "Toplam ciro", value: formatPrice(stats.ciro), hint: "Tüm faturalar" },
    { label: "Fatura", value: stats.faturaSayisi, hint: "Kesilen fatura" },
    { label: "Müşteri", value: stats.musteriSayisi, hint: "Kayıtlı müşteri" },
    { label: "Ürün", value: stats.urunSayisi, hint: `${stats.sirketSayisi} satıcı şirket` },
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

async function RecentInvoices() {
  const invoices = await getInvoices(5);
  if (invoices.length === 0) return <EmptyState>Henüz fatura yok.</EmptyState>;
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>Fatura no</th>
            <th className={thClass}>Müşteri</th>
            <th className={thClass}>Tarih</th>
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
              <td className={tdClass}>{f.musteriAd ?? "—"}</td>
              <td className={`${tdClass} text-zinc-500`}>{formatDate(f.tarih)}</td>
              <td className={`${tdClass} text-right`}>{formatPrice(f.tutar)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function LowStock() {
  const { azalanStok } = await getDashboardStats();
  if (azalanStok.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
        Tüm ürünlerin stoğu yeterli.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
      {azalanStok.map((p) => (
        <li key={p.urunNo} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
          <Link href={`/admin/products/${p.urunNo}`} className="hover:text-indigo-600">
            {productName(p)}
          </Link>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              p.stokMiktari === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
            }`}
          >
            {p.stokMiktari === 0 ? "Tükendi" : `${p.stokMiktari} adet`}
          </span>
        </li>
      ))}
    </ul>
  );
}
