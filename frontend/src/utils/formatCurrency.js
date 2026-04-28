export function formatCurrency(value) {
  const num = Number(value) || 0;
  return `₹${new Intl.NumberFormat('en-IN').format(num)}`;
}
