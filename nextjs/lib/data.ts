import { connection } from "next/server";
import {
  seedCategories,
  seedCustomers,
  seedOrders,
  seedProducts,
} from "./mock-data";
import type {
  Category,
  Customer,
  Order,
  OrderWithCustomer,
  Product,
  ProductWithCategory,
} from "./types";

// Data access layer.
//
// Every page and action reads and writes data only through this file. It
// currently uses an in-memory store seeded from mock-data.ts. When the MySQL
// tables are ready, replace each function body with a query; the function
// signatures and return types stay the same, so no UI code has to change.

type Store = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
};

// Kept on globalThis so the data survives hot reloads in development.
const globalStore = globalThis as unknown as { __vtysStore?: Store };

function db(): Store {
  globalStore.__vtysStore ??= {
    categories: structuredClone(seedCategories),
    products: structuredClone(seedProducts),
    customers: structuredClone(seedCustomers),
    orders: structuredClone(seedOrders),
  };
  return globalStore.__vtysStore;
}

// Data is read per request, like a real database. Callers must render inside
// a <Suspense> boundary.
async function read(): Promise<Store> {
  await connection();
  return db();
}

function nextId(rows: { id: number }[], start = 1): number {
  return rows.reduce((max, row) => Math.max(max, row.id), start - 1) + 1;
}

// ---------- Categories ----------

export async function getCategories(): Promise<Category[]> {
  const { categories } = await read();
  return categories;
}

// ---------- Products ----------

export async function getProducts(
  filter: { categorySlug?: string; query?: string } = {},
): Promise<ProductWithCategory[]> {
  const { products, categories } = await read();
  const category = filter.categorySlug
    ? categories.find((c) => c.slug === filter.categorySlug)
    : undefined;
  const query = filter.query?.trim().toLocaleLowerCase("tr");

  return products
    .filter((p) => !filter.categorySlug || p.categoryId === category?.id)
    .filter(
      (p) =>
        !query ||
        p.name.toLocaleLowerCase("tr").includes(query) ||
        p.description.toLocaleLowerCase("tr").includes(query),
    )
    .map((p) => ({ ...p, category: categories.find((c) => c.id === p.categoryId) }));
}

export async function getProduct(
  id: number,
): Promise<ProductWithCategory | undefined> {
  const { products, categories } = await read();
  const product = products.find((p) => p.id === id);
  if (!product) return undefined;
  return {
    ...product,
    category: categories.find((c) => c.id === product.categoryId),
  };
}

export type ProductInput = Omit<Product, "id" | "createdAt">;

export async function insertProduct(input: ProductInput): Promise<Product> {
  const store = db();
  const product: Product = {
    ...input,
    id: nextId(store.products),
    createdAt: new Date().toISOString(),
  };
  store.products.push(product);
  return product;
}

export async function updateProductRow(
  id: number,
  input: ProductInput,
): Promise<boolean> {
  const product = db().products.find((p) => p.id === id);
  if (!product) return false;
  Object.assign(product, input);
  return true;
}

export async function deleteProductRow(id: number): Promise<void> {
  const store = db();
  store.products = store.products.filter((p) => p.id !== id);
}

// ---------- Customers ----------

export async function getCustomers(): Promise<
  (Customer & { orderCount: number; totalSpent: number })[]
> {
  const { customers, orders } = await read();
  return customers.map((c) => {
    const own = orders.filter(
      (o) => o.customerId === c.id && o.status !== "cancelled",
    );
    return {
      ...c,
      orderCount: own.length,
      totalSpent: own.reduce((sum, o) => sum + o.total, 0),
    };
  });
}

/** Finds a customer by email, or creates one. */
export async function upsertCustomer(
  input: Omit<Customer, "id" | "createdAt">,
): Promise<Customer> {
  const store = db();
  const email = input.email.toLowerCase();
  const existing = store.customers.find((c) => c.email === email);
  if (existing) {
    Object.assign(existing, { ...input, email });
    return existing;
  }
  const customer: Customer = {
    ...input,
    email,
    id: nextId(store.customers),
    createdAt: new Date().toISOString(),
  };
  store.customers.push(customer);
  return customer;
}

// ---------- Orders ----------

export async function getOrders(): Promise<OrderWithCustomer[]> {
  const { orders, customers } = await read();
  return [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => ({ ...o, customer: customers.find((c) => c.id === o.customerId) }));
}

export async function getOrder(
  id: number,
): Promise<OrderWithCustomer | undefined> {
  const { orders, customers } = await read();
  const order = orders.find((o) => o.id === id);
  if (!order) return undefined;
  return { ...order, customer: customers.find((c) => c.id === order.customerId) };
}

export async function insertOrder(
  input: Omit<Order, "id" | "createdAt" | "status">,
): Promise<Order> {
  const store = db();
  // Stock is checked and reduced in the same step. In SQL this should be one
  // transaction.
  for (const item of input.items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error(`Yetersiz stok: ${item.productName}`);
    }
  }
  for (const item of input.items) {
    const product = store.products.find((p) => p.id === item.productId)!;
    product.stock -= item.quantity;
  }
  const order: Order = {
    ...input,
    id: nextId(store.orders, 1001),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.orders.push(order);
  return order;
}

export async function updateOrderStatusRow(
  id: number,
  status: Order["status"],
): Promise<void> {
  const order = db().orders.find((o) => o.id === id);
  if (order) order.status = status;
}

// ---------- Dashboard ----------

export async function getDashboardStats() {
  const { orders, products, customers } = await read();
  const active = orders.filter((o) => o.status !== "cancelled");
  return {
    revenue: active.reduce((sum, o) => sum + o.total, 0),
    orderCount: orders.length,
    pendingCount: orders.filter((o) => o.status === "pending").length,
    customerCount: customers.length,
    productCount: products.length,
    lowStock: products.filter((p) => p.stock <= 5),
  };
}
