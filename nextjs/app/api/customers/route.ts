import { handle, json, readBody, refreshSite, valid } from "@/lib/api";
import { getCustomer, getCustomers, insertCustomer } from "@/lib/data";
import { validateCustomer } from "@/lib/validation";

/** GET /api/customers — list customers (musteri) with purchase totals. */
export async function GET() {
  return handle(async () => json(await getCustomers()));
}

/**
 * POST /api/customers — create a customer. 409 if the kimlikNo already exists.
 * Body: { kimlikNo, ad, adres?, telefonlar?: string[] }
 */
export async function POST(request: Request) {
  return handle(async () => {
    const customer = valid(validateCustomer(await readBody(request)));
    await insertCustomer(customer);
    refreshSite();
    return json(await getCustomer(customer.kimlikNo), 201);
  });
}
