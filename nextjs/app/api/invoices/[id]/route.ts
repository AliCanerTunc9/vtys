import { ApiError, handle, json, parseId, refreshSite } from "@/lib/api";
import { deleteInvoice, getInvoice } from "@/lib/data";

type Context = RouteContext<"/api/invoices/[id]">;

/** GET /api/invoices/:id — one invoice with its customer and products. */
export async function GET(_request: Request, ctx: Context) {
  return handle(async () => {
    const invoice = await getInvoice(parseId((await ctx.params).id, "Fatura"));
    if (!invoice) throw new ApiError("Fatura bulunamadı.", 404);
    return json(invoice);
  });
}

/**
 * DELETE /api/invoices/:id — cancel an invoice: removes its satin_alir rows,
 * returns the stock and deletes the fatura row.
 *
 * There is no PUT: the amount (tutar) is calculated from the products when
 * the invoice is created, so to change an order, delete it and create a new one.
 */
export async function DELETE(_request: Request, ctx: Context) {
  return handle(async () => {
    await deleteInvoice(parseId((await ctx.params).id, "Fatura"));
    refreshSite();
    return new Response(null, { status: 204 });
  });
}
