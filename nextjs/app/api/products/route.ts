import { handle, json, readBody, refreshSite, valid } from "@/lib/api";
import { getProduct, getProducts, insertProduct } from "@/lib/data";
import { validateProduct } from "@/lib/validation";

/**
 * GET /api/products — list products (urun).
 * Optional query: ?marka=Apple&satici=1&q=kablosuz
 */
export async function GET(request: Request) {
  return handle(async () => {
    const params = new URL(request.url).searchParams;
    const satici = Number(params.get("satici"));
    const products = await getProducts({
      marka: params.get("marka") ?? undefined,
      sirketNo: Number.isInteger(satici) && satici > 0 ? satici : undefined,
      query: params.get("q") ?? undefined,
    });
    return json(products);
  });
}

/**
 * POST /api/products — create a product.
 * Body: { marka, model, teknikOzellikler?, birimFiyati, garantiSuresiAy?, stokMiktari, saticilar?: number[] }
 */
export async function POST(request: Request) {
  return handle(async () => {
    const { input, saticilar } = valid(validateProduct(await readBody(request)));
    const urunNo = await insertProduct(input, saticilar);
    refreshSite();
    return json(await getProduct(urunNo), 201);
  });
}
