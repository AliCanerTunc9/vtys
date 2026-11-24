import type { Metadata } from "next";
import { CompanyForm } from "@/components/admin/company-form";
import { PageHeader } from "@/components/admin/page-header";
import { createCompany } from "@/lib/actions";

export const metadata: Metadata = { title: "Yeni şirket" };

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader title="Yeni şirket" description="Ürün satan yeni bir şirket ekleyin" />
      <CompanyForm action={createCompany} />
    </>
  );
}
