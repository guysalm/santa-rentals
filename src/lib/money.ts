/** USD from cents: whole dollars print without decimals ($85), anything else with two ($14.40). */
export const formatUSD = (cents: number, opts: { decimals?: boolean } = {}) => {
  const digits = opts.decimals || cents % 100 !== 0 ? 2 : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cents / 100);
};
