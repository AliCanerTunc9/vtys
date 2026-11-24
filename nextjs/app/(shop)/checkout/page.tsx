import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Ödeme" };

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Siparişi tamamla</h1>
      <CheckoutForm />
    </div>
  );
}
