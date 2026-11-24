import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Sepetim" };

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sepetim</h1>
      <CartView />
    </div>
  );
}
