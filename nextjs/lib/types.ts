// Data shapes used by the UI. Each one maps to a table in Eticaret.sql; field
// names are the column names in camelCase (urun_no -> urunNo).

/** Table `urun`. */
export type Product = {
  urunNo: number;
  marka: string;
  model: string;
  teknikOzellikler: string | null;
  birimFiyati: number;
  garantiSuresiAy: number | null;
  stokMiktari: number;
};

/** A product together with the companies that sell it (`satar`). */
export type ProductWithSellers = Product & { saticilar: Company[] };

/** Table `sirket`. */
export type Company = {
  sirketNo: number;
  ad: string;
  adres: string | null;
  telefonNo: string | null;
};

/** Table `musteri`. */
export type Customer = {
  kimlikNo: string;
  ad: string;
  adres: string | null;
  telefonNo: string | null;
};

/** Table `fatura`. `tarih` is a DATE, returned as "YYYY-MM-DD". */
export type Invoice = {
  faturaNo: number;
  tutar: number;
  tarih: string;
};

/** An invoice with the customer and products linked to it via `satin_alir`. */
export type InvoiceDetail = Invoice & {
  musteri: Customer | null;
  urunler: Product[];
};

/**
 * Result returned by form actions used with useActionState. `values` sends
 * the submitted fields back so the form can be refilled after an error
 * (React resets forms after an action).
 */
export type FormState = { error?: string; values?: Record<string, string> };

export function productName(p: Pick<Product, "marka" | "model">): string {
  return `${p.marka} ${p.model}`;
}
