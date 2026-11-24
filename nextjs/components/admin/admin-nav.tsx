"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const adminLinks = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/products", label: "Ürünler" },
  { href: "/admin/orders", label: "Siparişler" },
  { href: "/admin/customers", label: "Müşteriler" },
];

const base = "block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition";

export function AdminNav() {
  const pathname = usePathname();
  return <NavLinks isActive={(href) => (href === "/admin" ? pathname === href : pathname.startsWith(href))} />;
}

/** Same links without highlighting; shown until the current path is known. */
export function AdminNavFallback() {
  return <NavLinks isActive={() => false} />;
}

function NavLinks({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {adminLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${base} ${
            isActive(link.href)
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
