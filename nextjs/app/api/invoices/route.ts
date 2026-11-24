import { ApiError, handle, json, readBody, refreshSite, valid } from "@/lib/api";
import { createPurchase, getInvoice, getInvoices } from "@/lib/data";
import { isObject, validateCustomer, validateProductList } from "@/lib/validation";

/** GET /api/invoices — list invoices (fatura) with customer and product count. */
export async function GET() {
  return handle(async () => json(await getInvoices()));
}

/**
 * POST /api/invoices — place an order. Saves the customer (musteri), creates
 * the invoice (fatura), adds one satin_alir row per product and lowers stock.
 * Body: { musteri: { kimlikNo, ad, adres, telefonlar: string[] }, urunler: [urunNo, ...] }
 * The phone numbers are added to the customer's saved numbers.
 * 409 if a product is out of stock or the customer already bought it.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readBody(request);
    if (!isObject(body.musteri)) throw new ApiError("musteri alanı bir nesne olmalı.", 400);
    const customer = valid(validateCustomer(body.musteri, { requireAll: true }));
    const urunler = valid(validateProductList(body.urunler));
    const faturaNo = await createPurchase(customer, urunler);
    refreshSite();
    return json(await getInvoice(faturaNo), 201);
  });
}
