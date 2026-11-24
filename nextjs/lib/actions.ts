"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as data from "./data";
import type { FormState } from "./types";
import {
  validateCompany,
  validateCustomer,
  validateProduct,
  validateProductList,
} from "./validation";

// Server Actions used by the site's forms. Validation rules are shared with
// the REST API in lib/validation.ts.
//
// TODO: The admin actions have no authentication yet. Add an admin check to
// each of them before this goes beyond local development.

/**
 * The submitted text fields, used to refill a form after an error. Fields
 * sent more than once (checkboxes, phone inputs) are joined with newlines,
 * which can't be typed into a single-line input. See `multiValue()`.
 */
function fieldValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value !== "string" || key.startsWith("$ACTION")) return;
    values[key] = key in values ? `${values[key]}\n${value}` : value;
  });
  return values;
}

/**
 * Form fields as a plain object. Fields that can appear more than once
 * (`saticilar` checkboxes, `telefonlar` inputs) become arrays.
 */
function formObject(formData: FormData): Record<string, unknown> {
  return {
    ...Object.fromEntries(formData),
    saticilar: formData.getAll("saticilar"),
    telefonlar: formData.getAll("telefonlar").filter((v) => typeof v === "string"),
  };
}

/** Returns a user-facing message for known errors; rethrows anything else. */
function userMessage(e: unknown): string {
  if (e instanceof data.DataError) return e.message;
  throw e;
}

// ---------- Admin: products (urun, satar) ----------

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = validateProduct(formObject(formData));
  if (!result.ok) return { error: result.error, values: fieldValues(formData) };
  try {
    await data.insertProduct(result.value.input, result.value.saticilar);
  } catch (e) {
    return { error: userMessage(e), values: fieldValues(formData) };
  }
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(
  urunNo: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = validateProduct(formObject(formData));
  if (!result.ok) return { error: result.error, values: fieldValues(formData) };
  try {
    await data.updateProduct(urunNo, result.value.input, result.value.saticilar);
  } catch (e) {
    return { error: userMessage(e), values: fieldValues(formData) };
  }
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(urunNo: number): Promise<FormState> {
  try {
    await data.deleteProduct(urunNo);
  } catch (e) {
    return { error: userMessage(e) };
  }
  revalidatePath("/", "layout");
  return {};
}

// ---------- Admin: companies (sirket) ----------

export async function createCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = validateCompany(formObject(formData));
  if (!result.ok) return { error: result.error, values: fieldValues(formData) };
  await data.insertCompany(result.value);
  revalidatePath("/", "layout");
  redirect("/admin/companies");
}

export async function updateCompany(
  sirketNo: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = validateCompany(formObject(formData));
  if (!result.ok) return { error: result.error, values: fieldValues(formData) };
  try {
    await data.updateCompany(sirketNo, result.value);
  } catch (e) {
    return { error: userMessage(e), values: fieldValues(formData) };
  }
  revalidatePath("/", "layout");
  redirect("/admin/companies");
}

export async function deleteCompany(sirketNo: number): Promise<FormState> {
  try {
    await data.deleteCompany(sirketNo);
  } catch (e) {
    return { error: userMessage(e) };
  }
  revalidatePath("/", "layout");
  return {};
}

// ---------- Customer: checkout (musteri, fatura, satin_alir) ----------

export async function placeOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const fail = (error: string): FormState => ({ error, values: fieldValues(formData) });

  const customer = validateCustomer(formObject(formData), { requireAll: true });
  if (!customer.ok) return fail(customer.error);

  // The cart sends only product numbers. Prices and stock are read again
  // from the database, so the browser cannot change them.
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? ""));
  } catch {
    return fail("Sepet okunamadı.");
  }
  const urunler = validateProductList(items);
  if (!urunler.ok) return fail(urunler.error);

  let faturaNo: number;
  try {
    faturaNo = await data.createPurchase(customer.value, urunler.value);
  } catch (e) {
    return fail(userMessage(e));
  }

  revalidatePath("/", "layout");
  redirect(`/checkout/success?fatura=${faturaNo}`);
}
