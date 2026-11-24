// Shared data shapes. These mirror the planned SQL tables, so keep them in
// sync with the schema the database side defines.

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  createdAt: string; // ISO date
};

export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
};

export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: number;
  customerId: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  address: string;
  city: string;
  createdAt: string;
};

export type ProductWithCategory = Product & { category: Category | undefined };

export type OrderWithCustomer = Order & { customer: Customer | undefined };

/**
 * Result returned by form actions used with useActionState. `values` sends
 * the submitted fields back so the form can be refilled after an error
 * (React resets forms after an action).
 */
export type FormState = { error?: string; values?: Record<string, string> };
