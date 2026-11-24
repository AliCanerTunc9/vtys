import { ApiError, handle, json, readBody, refreshSite, valid } from "@/lib/api";
import { deleteCustomer, getCustomer, getCustomerInvoices, updateCustomer } from "@/lib/data";
import { validateCustomer } from "@/lib/validation";

type Context = RouteContext<"/api/customers/[kimlikNo]">;

/** GET /api/customers/:kimlikNo — one customer with their invoices. */
export async function GET(_request: Request, ctx: Context) {
  return handle(async () => {
    const { kimlikNo } = await ctx.params;
    const [customer, faturalar] = await Promise.all([getCustomer(kimlikNo), getCustomerInvoices(kimlikNo)]);
    if (!customer) throw new ApiError("Müşteri bulunamadı.", 404);
    return json({ ...customer, faturalar });
  });
}

/**
 * PUT /api/customers/:kimlikNo — replace a customer's name and contact
 * details. kimlikNo is the primary key and can't be changed.
 * Body: { ad, adres?, telefonlar?: string[] } — telefonlar replaces the phone list.
 */
export async function PUT(request: Request, ctx: Context) {
  return handle(async () => {
    const { kimlikNo } = await ctx.params;
    const { ad, adres, telefonlar } = valid(validateCustomer({ ...(await readBody(request)), kimlikNo }));
    await updateCustomer(kimlikNo, { ad, adres, telefonlar });
    refreshSite();
    return json(await getCustomer(kimlikNo));
  });
}

/** DELETE /api/customers/:kimlikNo — 409 if the customer has purchases. */
export async function DELETE(_request: Request, ctx: Context) {
  return handle(async () => {
    await deleteCustomer((await ctx.params).kimlikNo);
    refreshSite();
    return new Response(null, { status: 204 });
  });
}
