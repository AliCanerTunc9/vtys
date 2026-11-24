import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { connection } from "next/server";
import { pool, transaction } from "./db";
import type {
  Company,
  Customer,
  Invoice,
  InvoiceDetail,
  Product,
  ProductWithSellers,
} from "./types";

// Data access layer: every page and action reads and writes the database only
// through this file. Queries follow the tables in Eticaret.sql.

/**
 * An error whose message can be shown to the user as-is. `status` is the HTTP
 * status the API returns for it: 400 for a bad reference, 404 when a row
 * doesn't exist, 409 when a database rule blocks the change.
 */
export class DataError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409 = 409,
  ) {
    super(message);
  }
}

const notFound = (what: string) => new DataError(`${what} bulunamadı.`, 404);

type Row<T> = T & RowDataPacket;

async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  // Data is read per request; callers render inside a <Suspense> boundary.
  await connection();
  const [rows] = await pool().query<Row<T>[]>(sql, params);
  return rows;
}

const PRODUCT_COLUMNS = `
  u.urun_no AS urunNo, u.marka, u.model,
  u.teknik_ozellikler AS teknikOzellikler, u.birim_fiyati AS birimFiyati,
  u.garanti_suresi_ay AS garantiSuresiAy, u.stok_miktari AS stokMiktari`;

// Phone numbers are a multivalued attribute stored in sirket_telefon and
// musteri_telefon. They are read as a JSON array in a subquery and cleaned up
// with withPhones().
const COMPANY_COLUMNS = `s.sirket_no AS sirketNo, s.ad, s.adres,
  (SELECT JSON_ARRAYAGG(t.telefon_no) FROM sirket_telefon t WHERE t.sirket_no = s.sirket_no) AS telefonlar`;

const CUSTOMER_COLUMNS = `m.kimlik_no AS kimlikNo, m.ad, m.adres,
  (SELECT JSON_ARRAYAGG(t.telefon_no) FROM musteri_telefon t WHERE t.kimlik_no = m.kimlik_no) AS telefonlar`;

/** Turns the telefonlar column (JSON array, or NULL when none) into a sorted list. */
function withPhones<T extends { telefonlar: unknown }>(row: T): T & { telefonlar: string[] } {
  let value = row.telefonlar;
  if (typeof value === "string") value = JSON.parse(value);
  const telefonlar = Array.isArray(value) ? value.map(String).sort() : [];
  return { ...row, telefonlar };
}

/** Replaces the phone list of a company or customer. */
async function setPhones(
  conn: PoolConnection,
  table: "sirket_telefon" | "musteri_telefon",
  keyColumn: "sirket_no" | "kimlik_no",
  key: number | string,
  telefonlar: string[],
) {
  await conn.query(`DELETE FROM ${table} WHERE ${keyColumn} = ?`, [key]);
  if (telefonlar.length) {
    await conn.query(`INSERT INTO ${table} (${keyColumn}, telefon_no) VALUES ?`, [
      telefonlar.map((t) => [key, t]),
    ]);
  }
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// ---------- Products (urun, satar) ----------

export async function getProducts(
  filter: { marka?: string; sirketNo?: number; query?: string; limit?: number } = {},
): Promise<Product[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.marka) {
    where.push("u.marka = ?");
    params.push(filter.marka);
  }
  if (filter.sirketNo) {
    where.push("EXISTS (SELECT 1 FROM satar st WHERE st.urun_no = u.urun_no AND st.sirket_no = ?)");
    params.push(filter.sirketNo);
  }
  const q = filter.query?.trim();
  if (q) {
    where.push("CONCAT_WS(' ', u.marka, u.model, u.teknik_ozellikler) LIKE ?");
    params.push(`%${escapeLike(q)}%`);
  }
  let sql = `SELECT ${PRODUCT_COLUMNS} FROM urun u`;
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += " ORDER BY u.urun_no DESC";
  if (filter.limit) {
    sql += " LIMIT ?";
    params.push(filter.limit);
  }
  return query<Product>(sql, params);
}

export async function getProduct(urunNo: number): Promise<ProductWithSellers | undefined> {
  const [product] = await query<Product>(
    `SELECT ${PRODUCT_COLUMNS} FROM urun u WHERE u.urun_no = ?`,
    [urunNo],
  );
  if (!product) return undefined;
  const saticilar = await query<Company>(
    `SELECT ${COMPANY_COLUMNS} FROM sirket s
     JOIN satar st ON st.sirket_no = s.sirket_no
     WHERE st.urun_no = ? ORDER BY s.ad`,
    [urunNo],
  );
  return { ...product, saticilar: saticilar.map(withPhones) };
}

/** Distinct brands, for the brand filter. */
export async function getBrands(): Promise<string[]> {
  const rows = await query<{ marka: string }>(
    "SELECT DISTINCT marka FROM urun ORDER BY marka",
  );
  return rows.map((r) => r.marka);
}

export type ProductInput = Omit<Product, "urunNo">;

async function setSellers(
  conn: PoolConnection,
  urunNo: number,
  sirketNolar: number[],
) {
  if (sirketNolar.length) {
    const [found] = await conn.query<Row<{ n: number }>[]>(
      "SELECT COUNT(*) AS n FROM sirket WHERE sirket_no IN (?)",
      [sirketNolar],
    );
    if (found[0].n !== new Set(sirketNolar).size) {
      throw new DataError("Satıcı listesinde kayıtlı olmayan bir şirket numarası var.", 400);
    }
  }
  await conn.query("DELETE FROM satar WHERE urun_no = ?", [urunNo]);
  if (sirketNolar.length) {
    await conn.query("INSERT INTO satar (sirket_no, urun_no) VALUES ?", [
      sirketNolar.map((s) => [s, urunNo]),
    ]);
  }
}

export async function insertProduct(input: ProductInput, sirketNolar: number[]): Promise<number> {
  return transaction(async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO urun (marka, model, teknik_ozellikler, birim_fiyati, garanti_suresi_ay, stok_miktari)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.marka, input.model, input.teknikOzellikler, input.birimFiyati, input.garantiSuresiAy, input.stokMiktari],
    );
    await setSellers(conn, result.insertId, sirketNolar);
    return result.insertId;
  });
}

export async function updateProduct(
  urunNo: number,
  input: ProductInput,
  sirketNolar: number[],
): Promise<void> {
  await transaction(async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE urun SET marka = ?, model = ?, teknik_ozellikler = ?, birim_fiyati = ?,
         garanti_suresi_ay = ?, stok_miktari = ?
       WHERE urun_no = ?`,
      [input.marka, input.model, input.teknikOzellikler, input.birimFiyati, input.garantiSuresiAy, input.stokMiktari, urunNo],
    );
    if (result.affectedRows === 0) throw notFound("Ürün");
    await setSellers(conn, urunNo, sirketNolar);
  });
}

export async function deleteProduct(urunNo: number): Promise<void> {
  await transaction(async (conn) => {
    const [sold] = await conn.query<Row<{ n: number }>[]>(
      "SELECT COUNT(*) AS n FROM satin_alir WHERE urun_no = ?",
      [urunNo],
    );
    if (sold[0].n > 0) {
      throw new DataError("Bu ürün satın alınmış, faturalarda kullanıldığı için silinemez.");
    }
    await conn.query("DELETE FROM satar WHERE urun_no = ?", [urunNo]);
    const [result] = await conn.query<ResultSetHeader>("DELETE FROM urun WHERE urun_no = ?", [urunNo]);
    if (result.affectedRows === 0) throw notFound("Ürün");
  });
}

// ---------- Companies (sirket) ----------

export async function getCompanies(): Promise<(Company & { urunSayisi: number })[]> {
  const rows = await query<Company & { urunSayisi: number }>(
    `SELECT ${COMPANY_COLUMNS}, COUNT(st.urun_no) AS urunSayisi
     FROM sirket s LEFT JOIN satar st ON st.sirket_no = s.sirket_no
     GROUP BY s.sirket_no ORDER BY s.ad`,
  );
  return rows.map(withPhones);
}

export async function getCompany(sirketNo: number): Promise<Company | undefined> {
  const [company] = await query<Company>(
    `SELECT ${COMPANY_COLUMNS} FROM sirket s WHERE s.sirket_no = ?`,
    [sirketNo],
  );
  return company && withPhones(company);
}

export type CompanyInput = Omit<Company, "sirketNo">;

export async function insertCompany(input: CompanyInput): Promise<number> {
  return transaction(async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO sirket (ad, adres) VALUES (?, ?)",
      [input.ad, input.adres],
    );
    await setPhones(conn, "sirket_telefon", "sirket_no", result.insertId, input.telefonlar);
    return result.insertId;
  });
}

export async function updateCompany(sirketNo: number, input: CompanyInput): Promise<void> {
  await transaction(async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      "UPDATE sirket SET ad = ?, adres = ? WHERE sirket_no = ?",
      [input.ad, input.adres, sirketNo],
    );
    // affectedRows counts matched rows (see db.ts), so 0 means not found.
    if (result.affectedRows === 0) throw notFound("Şirket");
    await setPhones(conn, "sirket_telefon", "sirket_no", sirketNo, input.telefonlar);
  });
}

export async function deleteCompany(sirketNo: number): Promise<void> {
  const [rows] = await pool().query<Row<{ n: number }>[]>(
    "SELECT COUNT(*) AS n FROM satar WHERE sirket_no = ?",
    [sirketNo],
  );
  if (rows[0].n > 0) {
    throw new DataError(
      `Bu şirket ${rows[0].n} ürünün satıcısı. Silmeden önce ürünlerden satıcı olarak kaldırın.`,
    );
  }
  const [result] = await pool().query<ResultSetHeader>("DELETE FROM sirket WHERE sirket_no = ?", [sirketNo]);
  if (result.affectedRows === 0) throw notFound("Şirket");
}

// ---------- Customers (musteri) ----------

export async function getCustomers(): Promise<
  (Customer & { faturaSayisi: number; urunSayisi: number; toplamHarcama: number })[]
> {
  const rows = await query<Customer & { faturaSayisi: number; urunSayisi: number; toplamHarcama: number }>(
    `SELECT ${CUSTOMER_COLUMNS},
       COUNT(DISTINCT sa.fatura_no) AS faturaSayisi,
       COUNT(sa.urun_no) AS urunSayisi,
       COALESCE((SELECT SUM(f.tutar) FROM fatura f
                 WHERE f.fatura_no IN (SELECT fatura_no FROM satin_alir WHERE kimlik_no = m.kimlik_no)), 0)
         AS toplamHarcama
     FROM musteri m LEFT JOIN satin_alir sa ON sa.kimlik_no = m.kimlik_no
     GROUP BY m.kimlik_no ORDER BY m.ad`,
  );
  return rows.map(withPhones);
}

export async function getCustomer(kimlikNo: string): Promise<Customer | undefined> {
  const [customer] = await query<Customer>(
    `SELECT ${CUSTOMER_COLUMNS} FROM musteri m WHERE m.kimlik_no = ?`,
    [kimlikNo],
  );
  return customer && withPhones(customer);
}

/** Invoices that contain at least one product bought by this customer. */
export async function getCustomerInvoices(kimlikNo: string): Promise<Invoice[]> {
  return query(
    `SELECT f.fatura_no AS faturaNo, f.tutar, f.tarih FROM fatura f
     WHERE f.fatura_no IN (SELECT fatura_no FROM satin_alir WHERE kimlik_no = ?)
     ORDER BY f.tarih DESC, f.fatura_no DESC`,
    [kimlikNo],
  );
}

export async function insertCustomer(input: Customer): Promise<void> {
  await transaction(async (conn) => {
    try {
      await conn.query("INSERT INTO musteri (kimlik_no, ad, adres) VALUES (?, ?, ?)", [
        input.kimlikNo,
        input.ad,
        input.adres,
      ]);
    } catch (e) {
      if ((e as { code?: string }).code === "ER_DUP_ENTRY") {
        throw new DataError("Bu kimlik numarasıyla kayıtlı bir müşteri zaten var.");
      }
      throw e;
    }
    await setPhones(conn, "musteri_telefon", "kimlik_no", input.kimlikNo, input.telefonlar);
  });
}

export async function updateCustomer(
  kimlikNo: string,
  input: Omit<Customer, "kimlikNo">,
): Promise<void> {
  await transaction(async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      "UPDATE musteri SET ad = ?, adres = ? WHERE kimlik_no = ?",
      [input.ad, input.adres, kimlikNo],
    );
    if (result.affectedRows === 0) throw notFound("Müşteri");
    await setPhones(conn, "musteri_telefon", "kimlik_no", kimlikNo, input.telefonlar);
  });
}

export async function deleteCustomer(kimlikNo: string): Promise<void> {
  const [rows] = await pool().query<Row<{ n: number }>[]>(
    "SELECT COUNT(*) AS n FROM satin_alir WHERE kimlik_no = ?",
    [kimlikNo],
  );
  if (rows[0].n > 0) {
    throw new DataError("Bu müşterinin satın alımları var, önce faturalarını silin.");
  }
  const [result] = await pool().query<ResultSetHeader>("DELETE FROM musteri WHERE kimlik_no = ?", [kimlikNo]);
  if (result.affectedRows === 0) throw notFound("Müşteri");
}

// ---------- Invoices (fatura, satin_alir) ----------

export type InvoiceListItem = Invoice & {
  kimlikNo: string | null;
  musteriAd: string | null;
  urunSayisi: number;
};

export async function getInvoices(limit?: number): Promise<InvoiceListItem[]> {
  return query(
    `SELECT f.fatura_no AS faturaNo, f.tutar, f.tarih,
       MIN(m.kimlik_no) AS kimlikNo, MIN(m.ad) AS musteriAd, COUNT(sa.urun_no) AS urunSayisi
     FROM fatura f
     LEFT JOIN satin_alir sa ON sa.fatura_no = f.fatura_no
     LEFT JOIN musteri m ON m.kimlik_no = sa.kimlik_no
     GROUP BY f.fatura_no
     ORDER BY f.tarih DESC, f.fatura_no DESC
     ${limit ? "LIMIT ?" : ""}`,
    limit ? [limit] : [],
  );
}

export async function getInvoice(faturaNo: number): Promise<InvoiceDetail | undefined> {
  const [invoice] = await query<Invoice>(
    "SELECT fatura_no AS faturaNo, tutar, tarih FROM fatura WHERE fatura_no = ?",
    [faturaNo],
  );
  if (!invoice) return undefined;
  const [customers, urunler] = await Promise.all([
    query<Customer>(
      `SELECT ${CUSTOMER_COLUMNS} FROM musteri m
       WHERE m.kimlik_no IN (SELECT kimlik_no FROM satin_alir WHERE fatura_no = ?)`,
      [faturaNo],
    ),
    query<Product>(
      `SELECT ${PRODUCT_COLUMNS} FROM urun u
       JOIN satin_alir sa ON sa.urun_no = u.urun_no WHERE sa.fatura_no = ?
       ORDER BY u.marka, u.model`,
      [faturaNo],
    ),
  ]);
  return { ...invoice, musteri: customers[0] ? withPhones(customers[0]) : null, urunler };
}

/**
 * Creates a purchase: saves the customer, creates an invoice, links each
 * product to it in satin_alir and lowers stock by one. Returns the invoice no.
 *
 * satin_alir has no quantity column and its primary key is
 * (urun_no, kimlik_no), so a customer buys one of each product, and cannot
 * buy a product they bought before.
 */
export async function createPurchase(customer: Customer, urunNolar: number[]): Promise<number> {
  const ids = [...new Set(urunNolar)];
  if (ids.length === 0) throw new DataError("Sepetiniz boş.", 400);

  return transaction(async (conn) => {
    await conn.query(
      `INSERT INTO musteri (kimlik_no, ad, adres) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE ad = VALUES(ad), adres = VALUES(adres)`,
      [customer.kimlikNo, customer.ad, customer.adres],
    );
    // Phone numbers given at checkout are added to the customer's list;
    // numbers saved earlier are kept.
    if (customer.telefonlar.length) {
      await conn.query("INSERT IGNORE INTO musteri_telefon (kimlik_no, telefon_no) VALUES ?", [
        customer.telefonlar.map((t) => [customer.kimlikNo, t]),
      ]);
    }

    // Lock the product rows so stock can't change until we commit.
    const [products] = await conn.query<Row<Product>[]>(
      `SELECT ${PRODUCT_COLUMNS} FROM urun u WHERE u.urun_no IN (?) FOR UPDATE`,
      [ids],
    );
    if (products.length !== ids.length) {
      throw new DataError("Sepetteki bir ürün artık satışta değil.", 400);
    }
    const outOfStock = products.filter((p) => p.stokMiktari < 1);
    if (outOfStock.length) {
      throw new DataError(
        `Stokta kalmayan ürün: ${outOfStock.map((p) => `${p.marka} ${p.model}`).join(", ")}`,
      );
    }

    const [bought] = await conn.query<Row<{ urunNo: number }>[]>(
      "SELECT urun_no AS urunNo FROM satin_alir WHERE kimlik_no = ? AND urun_no IN (?)",
      [customer.kimlikNo, ids],
    );
    if (bought.length) {
      const names = products
        .filter((p) => bought.some((b) => b.urunNo === p.urunNo))
        .map((p) => `${p.marka} ${p.model}`);
      throw new DataError(
        `Bu ürünleri daha önce satın aldınız: ${names.join(", ")}. Sepetten çıkarıp tekrar deneyin.`,
      );
    }

    const tutar =
      Math.round(products.reduce((sum, p) => sum + p.birimFiyati, 0) * 100) / 100;
    const [invoice] = await conn.query<ResultSetHeader>(
      "INSERT INTO fatura (tutar, tarih) VALUES (?, CURDATE())",
      [tutar],
    );
    await conn.query("INSERT INTO satin_alir (urun_no, kimlik_no, fatura_no) VALUES ?", [
      ids.map((id) => [id, customer.kimlikNo, invoice.insertId]),
    ]);
    await conn.query("UPDATE urun SET stok_miktari = stok_miktari - 1 WHERE urun_no IN (?)", [ids]);
    return invoice.insertId;
  });
}

/**
 * Deletes an invoice: removes its satin_alir rows, puts the stock back (one
 * per product) and deletes the fatura row.
 */
export async function deleteInvoice(faturaNo: number): Promise<void> {
  await transaction(async (conn) => {
    const [items] = await conn.query<Row<{ urunNo: number }>[]>(
      "SELECT urun_no AS urunNo FROM satin_alir WHERE fatura_no = ? FOR UPDATE",
      [faturaNo],
    );
    if (items.length) {
      await conn.query("DELETE FROM satin_alir WHERE fatura_no = ?", [faturaNo]);
      await conn.query("UPDATE urun SET stok_miktari = stok_miktari + 1 WHERE urun_no IN (?)", [
        items.map((i) => i.urunNo),
      ]);
    }
    const [result] = await conn.query<ResultSetHeader>("DELETE FROM fatura WHERE fatura_no = ?", [faturaNo]);
    if (result.affectedRows === 0) throw notFound("Fatura");
  });
}

// ---------- Dashboard ----------

export async function getDashboardStats() {
  const [counts] = await query<{
    ciro: number;
    faturaSayisi: number;
    musteriSayisi: number;
    urunSayisi: number;
    sirketSayisi: number;
  }>(
    `SELECT
       (SELECT COALESCE(SUM(tutar), 0) FROM fatura) AS ciro,
       (SELECT COUNT(*) FROM fatura) AS faturaSayisi,
       (SELECT COUNT(*) FROM musteri) AS musteriSayisi,
       (SELECT COUNT(*) FROM urun) AS urunSayisi,
       (SELECT COUNT(*) FROM sirket) AS sirketSayisi`,
  );
  const azalanStok = await query<Product>(
    `SELECT ${PRODUCT_COLUMNS} FROM urun u WHERE u.stok_miktari <= 5
     ORDER BY u.stok_miktari, u.marka LIMIT 10`,
  );
  return { ...counts, azalanStok };
}
