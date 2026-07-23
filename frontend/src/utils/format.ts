export function formatCurrency(amount: number | null | undefined, currency?: string, locale?: string) {
  const value = typeof amount === "number" ? amount : 0;
  const curr = currency || (import.meta.env.VITE_CURRENCY as string) || "INR";
  const loc = locale || (typeof navigator !== "undefined" ? navigator.language : "en-IN");
  try {
    return new Intl.NumberFormat(loc, { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(value);
  } catch (e) {
    return `${curr} ${value.toLocaleString()}`;
  }
}
