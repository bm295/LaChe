import { test, expect } from '@playwright/test';

// UI implementation of features/valid-batch-sizes.feature.
test('Calculate portions from available stock packs', async ({ page }) => {
  await page.goto('/');
  const planner = page.locator('form').filter({
    has: page.getByRole('heading', { name: 'Production planner' }),
  });
  const ingredients = planner.locator('fieldset');
  await expect(ingredients).toHaveCount(2);

  await test.step('Given recipe requirements and available ingredient packs', async () => {
    const stock = [
      { name: 'A', perPortion: '2', packs: '3', unitsPerPack: '24' },
      { name: 'B', perPortion: '3', packs: '2', unitsPerPack: '36' },
    ];
    for (const [index, ingredient] of stock.entries()) {
      const row = ingredients.nth(index);
      await row.getByRole('textbox', { name: 'Ingredient name' }).fill(ingredient.name);
      await row.getByRole('spinbutton', { name: 'Units per portion', exact: true }).fill(ingredient.perPortion);
      await row.getByRole('spinbutton', { name: 'Pack count', exact: true }).fill(ingredient.packs);
      await row.getByRole('spinbutton', { name: 'Units per pack', exact: true }).fill(ingredient.unitsPerPack);
    }
  });

  await test.step('When I calculate the maximum producible portions', async () => {
    await planner.getByRole('button', { name: 'Calculate portions', exact: true }).click();
  });

  await test.step('Then the kitchen can prepare 24 complete portions', async () => {
    await expect(planner.locator('.result')).toHaveText('24 complete portions can be prepared.');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
