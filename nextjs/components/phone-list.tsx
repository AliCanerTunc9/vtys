/** Shows a list of phone numbers, one per line, or a dash when there are none. */
export function PhoneList({ phones, className = "" }: { phones: string[]; className?: string }) {
  if (phones.length === 0) return <span className={className}>—</span>;
  return (
    <ul className={className}>
      {phones.map((p) => (
        <li key={p} className="whitespace-nowrap">
          <a href={`tel:${p.replace(/[^\d+]/g, "")}`} className="hover:text-indigo-600">
            {p}
          </a>
        </li>
      ))}
    </ul>
  );
}
