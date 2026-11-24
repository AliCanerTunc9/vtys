"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteProductRow,
  getCategories,
  getProduct,
  insertOrder,
  insertProduct,
  updateOrderStatusRow,
  updateProductRow,
  upsertCustomer,
  type ProductInput,
} from "./data";
import { roundMoney, shippingFor } from "./pricing";
import { ORDER_STATUSES, type FormState, type OrderItem, type OrderStatus } from "./types";

// TODO: The admin actions have no authentication yet. Add an admin check to
// each of them before this goes beyond local development.

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** The submitted text fields, used to refill a form after an error. */
function fieldValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  });
  return values;
}

// ---------- Admin: products ----------

async function parseProduct(
  formData: FormData,
): Promise<{ data?: ProductInput; error?: string }> {
  const name = text(formData, "name");
  const description = text(formData, "description");
  const price = Number(text(formData, "price").replace(",", "."));
  const stock = Number(text(formData, "stock"));
  const categoryId = Number(text(formData, "categoryId"));

  if (!name) return { error: "Ürün adı zorunlu." };
  if (!Number.isFinite(price) || price <= 0)
    return { error: "Fiyat 0'dan büyük bir sayı olmalı." };
  if (!Number.isInteger(stock) || stock < 0)
    return { error: "Stok 0 veya daha büyük bir tam sayı olmalı." };
  const categories = await getCategories();
  if (!categories.some((c) => c.id === categoryId))
    return { error: "Geçerli bir kategori seçin." };

  return {
    data: { name, description, price: roundMoney(price), stock, categoryId },
  };
}

export async function createProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { data, error } = await parseProduct(formData);
  if (!data) return { error, values: fieldValues(formData) };
  await insertProduct(data);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { data, error } = await parseProduct(formData);
  if (!data) return { error, values: fieldValues(formData) };
  const ok = await updateProductRow(id, data);
  if (!ok) return { error: "Ürün bulunamadı.", values: fieldValues(formData) };
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: number): Promise<void> {
  await deleteProductRow(id);
  revalidatePath("/", "layout");
}

// ---------- Admin: orders ----------

export async function updateOrderStatus(
  id: number,
  formData: FormData,
): Promise<void> {
  const status = text(formData, "status") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return;
  await updateOrderStatusRow(id, status);
  revalidatePath("/admin", "layout");
}

// ---------- Customer: checkout ----------

export async function placeOrder(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await createOrderFromForm(formData);
  if (typeof result === "string") {
    return { error: result, values: fieldValues(formData) };
  }
  revalidatePath("/", "layout");
  redirect(`/checkout/success?order=${result.orderId}`);
}

/** Returns the new order id, or an error message for the customer. */
async function createOrderFromForm(
  formData: FormData,
): Promise<{ orderId: number } | string> {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const city = text(formData, "city");
  const address = text(formData, "address");

  if (!firstName || !lastName || !email || !phone || !city || !address) {
    return "Lütfen tüm alanları doldurun.";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Geçerli bir e-posta adresi girin.";
  }

  // The cart only sends product ids and quantities. Names and prices are
  // always read again on the server, so the client cannot change them.
  let requested: unknown;
  try {
    requested = JSON.parse(text(formData, "items"));
  } catch {
    return "Sepet okunamadı.";
  }
  if (!Array.isArray(requested) || requested.length === 0) {
    return "Sepetiniz boş.";
  }

  const items: OrderItem[] = [];
  for (const entry of requested as { productId?: unknown; quantity?: unknown }[]) {
    const quantity = Number(entry?.quantity);
    const product = await getProduct(Number(entry?.productId));
    if (!product) return "Sepetteki bir ürün artık satışta değil.";
    if (!Number.isInteger(quantity) || quantity < 1) return "Geçersiz ürün adedi.";
    if (product.stock < quantity) {
      return `${product.name} için yeterli stok yok (kalan: ${product.stock}).`;
    }
    items.push({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity,
    });
  }

  // Order total includes shipping, using the same rule as the cart.
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = roundMoney(subtotal + shippingFor(subtotal));

  try {
    const customer = await upsertCustomer({ firstName, lastName, email, phone, city });
    const order = await insertOrder({ customerId: customer.id, items, total, address, city });
    return { orderId: order.id };
  } catch (e) {
    return e instanceof Error ? e.message : "Sipariş oluşturulamadı.";
  }
}
