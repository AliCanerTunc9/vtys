import type { CompanyInput, ProductInput } from "./data";
import type { Customer } from "./types";

// Input checks shared by the site's forms (lib/actions.ts) and the REST API
// (app/api). Both pass a plain object; length limits come from Eticaret.sql.

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

type Raw = Record<string, unknown>;

const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

/** Trimmed string, or "" when missing. */
function str(raw: Raw, key: string): string {
  const v = raw[key];
  return typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
}

/** Trimmed string, or null when missing or empty (nullable columns). */
function nullableStr(raw: Raw, key: string): string | null {
  return str(raw, key) || null;
}

/** Number from a number or numeric string; NaN when missing or invalid. */
function num(raw: Raw, key: string): number {
  const v = raw[key];
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v.trim().replace(",", "."));
  return NaN;
}

function tooLong(value: string | null, max: number, label: string): string | undefined {
  if (value && value.length > max) return `${label} en fazla ${max} karakter olabilir.`;
}

export function isObject(value: unknown): value is Raw {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ---------- urun ----------

export function validateProduct(raw: Raw): Result<{ input: ProductInput; saticilar: number[] }> {
  const marka = str(raw, "marka");
  const model = str(raw, "model");
  const teknikOzellikler = nullableStr(raw, "teknikOzellikler");
  const birimFiyati = num(raw, "birimFiyati");
  const garantiMissing = raw.garantiSuresiAy === undefined || raw.garantiSuresiAy === null || str(raw, "garantiSuresiAy") === "";
  const garantiSuresiAy = garantiMissing ? null : num(raw, "garantiSuresiAy");
  const stokMiktari = num(raw, "stokMiktari");
  const sellersRaw = raw.saticilar ?? [];

  if (!marka) return fail("Marka zorunlu.");
  if (!model) return fail("Model zorunlu.");
  const lengthError = tooLong(marka, 100, "Marka") || tooLong(model, 100, "Model");
  if (lengthError) return fail(lengthError);
  if (!Number.isFinite(birimFiyati) || birimFiyati < 0 || birimFiyati >= 1e10) {
    return fail("Birim fiyatı 0 veya daha büyük bir sayı olmalı.");
  }
  if (garantiSuresiAy !== null && (!Number.isInteger(garantiSuresiAy) || garantiSuresiAy < 0 || garantiSuresiAy > 65535)) {
    return fail("Garanti süresi 0–65535 arasında tam sayı (ay) olmalı.");
  }
  if (!Number.isInteger(stokMiktari) || stokMiktari < 0 || stokMiktari > 4294967295) {
    return fail("Stok miktarı 0 veya daha büyük bir tam sayı olmalı.");
  }
  if (!Array.isArray(sellersRaw)) return fail("saticilar, şirket numaralarından oluşan bir dizi olmalı.");
  const saticilar = [...new Set(sellersRaw.map(Number))];
  if (saticilar.some((s) => !Number.isInteger(s) || s < 1)) {
    return fail("saticilar yalnızca geçerli şirket numaraları içermeli.");
  }

  return {
    ok: true,
    value: {
      input: {
        marka,
        model,
        teknikOzellikler,
        birimFiyati: Math.round(birimFiyati * 100) / 100,
        garantiSuresiAy,
        stokMiktari,
      },
      saticilar,
    },
  };
}

// ---------- sirket ----------

export function validateCompany(raw: Raw): Result<CompanyInput> {
  const ad = str(raw, "ad");
  const adres = nullableStr(raw, "adres");
  const telefonNo = nullableStr(raw, "telefonNo");
  if (!ad) return fail("Şirket adı zorunlu.");
  const lengthError =
    tooLong(ad, 150, "Şirket adı") || tooLong(adres, 255, "Adres") || tooLong(telefonNo, 32, "Telefon");
  return lengthError ? fail(lengthError) : { ok: true, value: { ad, adres, telefonNo } };
}

// ---------- musteri ----------

export function validateKimlikNo(kimlikNo: string): string | undefined {
  if (!/^\d{11}$/.test(kimlikNo)) return "T.C. kimlik numarası 11 haneli olmalı.";
}

/**
 * Checks a customer. At checkout all fields are required (`requireAll`); the
 * API allows leaving the nullable columns (adres, telefonNo) empty.
 */
export function validateCustomer(raw: Raw, { requireAll = false } = {}): Result<Customer> {
  const kimlikNo = str(raw, "kimlikNo");
  const ad = str(raw, "ad");
  const adres = nullableStr(raw, "adres");
  const telefonNo = nullableStr(raw, "telefonNo");

  if (!kimlikNo || !ad || (requireAll && (!adres || !telefonNo))) {
    return fail(requireAll ? "Lütfen tüm alanları doldurun." : "kimlikNo ve ad zorunlu.");
  }
  const error =
    validateKimlikNo(kimlikNo) ||
    tooLong(ad, 150, "Ad soyad") ||
    tooLong(adres, 255, "Adres") ||
    tooLong(telefonNo, 32, "Telefon");
  return error ? fail(error) : { ok: true, value: { kimlikNo, ad, adres, telefonNo } };
}

// ---------- satin alma (fatura + satin_alir) ----------

export function validateProductList(value: unknown): Result<number[]> {
  if (!Array.isArray(value)) return fail("urunler, ürün numaralarından oluşan bir dizi olmalı.");
  const ids = value.map(Number);
  if (ids.some((n) => !Number.isInteger(n) || n < 1)) {
    return fail("urunler yalnızca geçerli ürün numaraları içermeli.");
  }
  if (ids.length === 0) return fail("Sepetiniz boş.");
  if (new Set(ids).size !== ids.length) {
    return fail("Bir ürün aynı faturada yalnızca bir kez yer alabilir.");
  }
  return { ok: true, value: ids };
}
