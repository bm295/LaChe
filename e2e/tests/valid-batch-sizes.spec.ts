import { test, expect } from "@playwright/test";

test("Bếp tính số phần ăn, xử lý hết hàng và thêm/xóa nguyên liệu", async ({
  page,
}) => {
  await page.goto("/#kitchen");
  const rows = page.locator(".ingredient-row");
  await expect(rows).toHaveCount(2);
  for (const [index, stock] of [
    { name: "Cà phê", perPortion: "2", packs: "3", perPack: "24" },
    { name: "Sữa", perPortion: "3", packs: "2", perPack: "36" },
  ].entries()) {
    await rows.nth(index).getByLabel("Tên nguyên liệu").fill(stock.name);
    await rows
      .nth(index)
      .getByLabel("Đơn vị mỗi phần", { exact: true })
      .fill(stock.perPortion);
    await rows
      .nth(index)
      .getByLabel("Số gói", { exact: true })
      .fill(stock.packs);
    await rows
      .nth(index)
      .getByLabel("Đơn vị mỗi gói", { exact: true })
      .fill(stock.perPack);
  }
  await page.getByRole("button", { name: "Tính số phần ăn" }).click();
  await expect(page.locator(".capacity-result .result-number")).toHaveText(
    "24",
  );
  await rows.nth(0).getByLabel("Số gói", { exact: true }).fill("0");
  await expect(page.locator(".capacity-result")).toHaveCount(0);
  await page.getByRole("button", { name: "Tính số phần ăn" }).click();
  await expect(page.locator(".capacity-result .result-number")).toHaveText("0");
  await page.getByRole("button", { name: "Thêm nguyên liệu" }).click();
  await expect(rows).toHaveCount(3);
  await page.getByRole("button", { name: "Xóa nguyên liệu 3" }).click();
  await expect(rows).toHaveCount(2);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
