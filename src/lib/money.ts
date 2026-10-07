export const formatUSD = (cents: number, opts: { decimals?: boolean } = {}) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
