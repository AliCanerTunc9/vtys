import { handle, json, readBody, refreshSite, valid } from "@/lib/api";
import { getCompanies, getCompany, insertCompany } from "@/lib/data";
import { validateCompany } from "@/lib/validation";

/** GET /api/companies — list companies (sirket) with how many products each sells. */
export async function GET() {
  return handle(async () => json(await getCompanies()));
}

/**
 * POST /api/companies — create a company.
 * Body: { ad, adres?, telefonNo? }
 */
export async function POST(request: Request) {
  return handle(async () => {
    const input = valid(validateCompany(await readBody(request)));
    const sirketNo = await insertCompany(input);
    refreshSite();
    return json(await getCompany(sirketNo), 201);
  });
}
