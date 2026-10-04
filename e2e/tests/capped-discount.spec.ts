import { test, expect } from '@playwright/test';

// UI implementation of docs/features/capped-discount.md.
test('Giảm giá có mức trần', async ({ page }) => {
  await page.goto('/');
  const estimator = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Bill estimator' }) });
  await test.step('Given subtotal 1000000 VND, discount 20% and cap 100000 VND', async () => {
    await estimator.getByLabel('Subtotal', { exact: true }).fill('1000000');
    await estimator.getByLabel('Discount (%)', { exact: true }).fill('20');
    await estimator.getByLabel('Maximum discount (VND)', { exact: true }).fill('100000');
  });
  await test.step('When the cashier estimates the bill', async () => {
    await estimator.getByRole('button', { name: 'Estimate bill' }).click();
  });
  await test.step('Then the discount is capped and charges apply after discount', async () => {
    for (const [label, amount] of [['Discount', 100000], ['Service charge', 90000], ['VAT', 79200], ['Total', 1069200]] as const) {
      const row = estimator.locator('dl > div').filter({ has: page.locator('dt').getByText(label, { exact: true }) });
      const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
      await expect(row.locator('dd')).toHaveText(formatted);
    }
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
