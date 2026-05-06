export const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatMoney = (value: number | string) =>
  currency.format(typeof value === "string" ? Number(value) : value);

export const formatCourtType = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());

export const todayInputValue = () => new Date().toISOString().slice(0, 10);
