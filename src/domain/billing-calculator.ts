export interface BillSummary { subtotal: number; discount: number; serviceCharge: number; vat: number; total: number; }

export function calculateBill(subtotal: number, serviceChargeRate: number, vatRate: number, discountRate = 0, maximumDiscount = 0): BillSummary {
  if (!Number.isFinite(subtotal) || subtotal < 0 ||
      !Number.isFinite(discountRate) || discountRate < 0 || discountRate > 1 ||
      !Number.isFinite(maximumDiscount) || maximumDiscount < 0) {
    throw new Error('Subtotal and maximum discount must be finite non-negative numbers; discount rate must be between 0 and 1.');
  }
  const discount = Math.min(subtotal * discountRate, maximumDiscount);
  const discountedSubtotal = subtotal - discount;
  const serviceCharge = discountedSubtotal * serviceChargeRate;
  const vat = (discountedSubtotal + serviceCharge) * vatRate;
  return { subtotal: roundCurrency(subtotal), discount: roundCurrency(discount), serviceCharge: roundCurrency(serviceCharge), vat: roundCurrency(vat), total: roundCurrency(discountedSubtotal + serviceCharge + vat) };
}

function roundCurrency(amount: number): number { return Number(amount.toFixed(2)); }
