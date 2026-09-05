export interface BillSummary { subtotal: number; serviceCharge: number; vat: number; total: number; }

export function calculateBill(subtotal: number, serviceChargeRate: number, vatRate: number): BillSummary {
  const serviceCharge = subtotal * serviceChargeRate;
  const vat = (subtotal + serviceCharge) * vatRate;
  return { subtotal: roundCurrency(subtotal), serviceCharge: roundCurrency(serviceCharge), vat: roundCurrency(vat), total: roundCurrency(subtotal + serviceCharge + vat) };
}

function roundCurrency(amount: number): number { return Number(amount.toFixed(2)); }
