import { ApiError, handle, json, parseId, readBody, refreshSite, valid } from "@/lib/api";
import { deleteProduct, getProduct, updateProduct } from "@/lib/data";
import { validateProduct } from "@/lib/validation";

type Context = RouteContext<"/api/products/[id]">;

/** GET /api/products/:id — one product with its sellers (satar). */
export async function GET(_request: Request, ctx: Context) {
  return handle(async () => {
    const product = await getProduct(parseId((await ctx.params).id, "Ürün"));
    if (!product) throw new ApiError("Ürün bulunamadı.", 404);
    return json(product);
  });
}

/**
 * PUT /api/products/:id — replace all fields of a product.
 * Body: same as POST /api/products. `saticilar` replaces the seller list.
 */
export async function PUT(request: Request, ctx: Context) {
  return handle(async () => {
    const urunNo = parseId((await ctx.params).id, "Ürün");
    const { input, saticilar } = valid(validateProduct(await readBody(request)));
    await updateProduct(urunNo, input, saticilar);
    refreshSite();
    return json(await getProduct(urunNo));
  });
}

/** DELETE /api/products/:id — 409 if the product appears on an invoice. */
export async function DELETE(_request: Request, ctx: Context) {
  return handle(async () => {
    await deleteProduct(parseId((await ctx.params).id, "Ürün"));
    refreshSite();
    return new Response(null, { status: 204 });
  });
}
