const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "long",
  timeZone: "UTC",
});

export function formatPrice(value: number): string {
  return currency.format(value);
}

/** Formats a DATE column value ("YYYY-MM-DD"). */
export function formatDate(value: string): string {
  return dateFormat.format(new Date(`${value}T00:00:00Z`));
}

export function formatWarranty(months: number | null): string {
  if (months === null) return "Belirtilmemiş";
  if (months === 0) return "Garantisiz";
  if (months % 12 === 0) return `${months / 12} yıl`;
  return `${months} ay`;
}
