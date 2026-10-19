import { test, expect } from "@playwright/test";

test("Thu ngân tính giảm giá có mức trần và không hiển thị kết quả cũ sau chỉnh sửa", async ({
  page,
}) => {
  await page.goto("/#billing");
  await page.getByLabel("Tiền món trước giảm giá (VND)").fill("1000000");
  await page.getByLabel("Giảm giá (%)").fill("20");
  await page.getByLabel("Giảm tối đa (VND)").fill("100000");
  await page.getByRole("button", { name: "Tính hóa đơn", exact: true }).click();
  for (const [label, amount] of [
    ["Giảm giá", -100000],
    ["Phí phục vụ · 10%", 90000],
    ["VAT · 8%", 79200],
    ["Tổng thanh toán", 1069200],
  ] as const) {
    const row = page
      .locator("dl > div")
      .filter({ has: page.locator("dt").getByText(label, { exact: true }) });
    const formatted = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 2,
    }).format(amount);
    await expect(row.locator("dd")).toHaveText(formatted);
  }
  await page.screenshot({
    path: "test-results/billing-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("Tiền món trước giảm giá (VND)").fill("500000");
  await expect(page.getByText("Hóa đơn sẽ xuất hiện tại đây")).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
