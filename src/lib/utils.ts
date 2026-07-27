export function formatNaira(amount: number): string {
  if (!amount && amount !== 0) return '₦0';
  // If price was stored as smaller numbers (e.g. 950 for 950k NGN), normalize it
  const normalized = amount < 10000 ? amount * 1000 : amount;
  return `₦${normalized.toLocaleString()}`;
}
