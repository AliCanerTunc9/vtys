import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteButton } from "@/components/admin/delete-button";
import { cardClass, PageHeader, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { PhoneList } from "@/components/phone-list";
import { EmptyState, TableSkeleton } from "@/components/ui";
import { deleteCompany } from "@/lib/actions";
import { getCompanies } from "@/lib/data";

export const metadata: Metadata = { title: "Şirketler" };

export default function AdminCompaniesPage() {
  return (
    <>
      <PageHeader
        title="Şirketler"
        description="sirket tablosu: ürünleri satan şirketler"
        action={
          <Link
            href="/admin/companies/new"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Yeni şirket
          </Link>
        }
      />
      <Suspense fallback={<TableSkeleton rows={5} />}>
        <CompanyTable />
      </Suspense>
    </>
  );
}

async function CompanyTable() {
  const companies = await getCompanies();
  if (companies.length === 0) return <EmptyState>Henüz şirket yok.</EmptyState>;
  return (
    <div className={cardClass}>
      <table className={tableClass}>
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className={thClass}>No</th>
            <th className={thClass}>Şirket adı</th>
            <th className={thClass}>Adres</th>
            <th className={thClass}>Telefon</th>
            <th className={`${thClass} text-right`}>Sattığı ürün</th>
            <th className={`${thClass} text-right`}>İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {companies.map((c) => (
            <tr key={c.sirketNo} className="hover:bg-zinc-50">
              <td className={`${tdClass} font-mono text-zinc-500`}>{c.sirketNo}</td>
              <td className={`${tdClass} font-medium`}>{c.ad}</td>
              <td className={`${tdClass} text-zinc-600`}>{c.adres ?? "—"}</td>
              <td className={`${tdClass} text-zinc-600`}>
                <PhoneList phones={c.telefonlar} />
              </td>
              <td className={`${tdClass} text-right`}>
                <Link href={`/products?satici=${c.sirketNo}`} className="text-indigo-600 hover:underline">
                  {c.urunSayisi}
                </Link>
              </td>
              <td className={`${tdClass} text-right`}>
                <div className="flex items-start justify-end gap-3">
                  <Link href={`/admin/companies/${c.sirketNo}`} className="text-indigo-600 hover:underline">
                    Düzenle
                  </Link>
                  <DeleteButton
                    action={deleteCompany.bind(null, c.sirketNo)}
                    confirmText={`"${c.ad}" silinsin mi?`}
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
