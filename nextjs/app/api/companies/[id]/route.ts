import { ApiError, handle, json, parseId, readBody, refreshSite, valid } from "@/lib/api";
import { deleteCompany, getCompany, getProducts, updateCompany } from "@/lib/data";
import { validateCompany } from "@/lib/validation";

type Context = RouteContext<"/api/companies/[id]">;

/** GET /api/companies/:id — one company with the products it sells (satar). */
export async function GET(_request: Request, ctx: Context) {
  return handle(async () => {
    const sirketNo = parseId((await ctx.params).id, "Şirket");
    const [company, urunler] = await Promise.all([getCompany(sirketNo), getProducts({ sirketNo })]);
    if (!company) throw new ApiError("Şirket bulunamadı.", 404);
    return json({ ...company, urunler });
  });
}

/**
 * PUT /api/companies/:id — replace all fields of a company.
 * Body: { ad, adres?, telefonlar?: string[] } — telefonlar replaces the phone list.
 */
export async function PUT(request: Request, ctx: Context) {
  return handle(async () => {
    const sirketNo = parseId((await ctx.params).id, "Şirket");
    const input = valid(validateCompany(await readBody(request)));
    await updateCompany(sirketNo, input);
    refreshSite();
    return json(await getCompany(sirketNo));
  });
}

/** DELETE /api/companies/:id — 409 if the company still sells products. */
export async function DELETE(_request: Request, ctx: Context) {
  return handle(async () => {
    await deleteCompany(parseId((await ctx.params).id, "Şirket"));
    refreshSite();
    return new Response(null, { status: 204 });
  });
}
