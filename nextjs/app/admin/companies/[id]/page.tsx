import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CompanyForm } from "@/components/admin/company-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/ui";
import { updateCompany } from "@/lib/actions";
import { getCompany } from "@/lib/data";

export const metadata: Metadata = { title: "Şirketi düzenle" };

export default function EditCompanyPage({ params }: PageProps<"/admin/companies/[id]">) {
  return (
    <>
      <PageHeader title="Şirketi düzenle" />
      <Suspense fallback={<TableSkeleton rows={3} />}>
        <EditCompanyForm params={params} />
      </Suspense>
    </>
  );
}

async function EditCompanyForm({ params }: { params: PageProps<"/admin/companies/[id]">["params"] }) {
  const { id } = await params;
  const sirketNo = Number(id);
  const company = Number.isInteger(sirketNo) && sirketNo > 0 ? await getCompany(sirketNo) : undefined;
  if (!company) notFound();
  return <CompanyForm action={updateCompany.bind(null, company.sirketNo)} company={company} />;
}
