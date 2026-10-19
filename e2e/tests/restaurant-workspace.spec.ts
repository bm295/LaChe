import { test, expect } from "@playwright/test";

test("Tổng quan điều hướng đến các công việc và hiển thị trạng thái kết nối", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Chào một ngày phục vụ tốt." }),
  ).toBeVisible();
  await expect(page.getByText("Dịch vụ sẵn sàng")).toBeVisible();
  await page.screenshot({
    path: "test-results/overview-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Sắp xếp chỗ ngồi/ }).click();
  await expect(
    page.getByRole("heading", { name: "Bàn & chỗ ngồi", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#tables$/);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Chào một ngày phục vụ tốt." }),
  ).toBeVisible();
});

test("Tìm cụm bàn, lọc số khách và tính lại khi trạng thái thay đổi", async ({
  page,
}) => {
  await page.goto("/#tables");
  await page.getByRole("button", { name: "Dùng bố trí mẫu 6 bàn" }).click();
  await expect(page.locator(".table-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Tìm cụm bàn trống" }).click();
  await expect(page.locator(".group-card")).toHaveCount(3);
  await expect(page.locator(".group-card").first()).toContainText(
    "Bàn 1 + Bàn 2",
  );
  await page.locator(".party-filter input").fill("6");
  await expect(page.locator(".group-card")).toHaveCount(1);
  await page
    .getByLabel("Trạng thái bàn 2", { exact: true })
    .selectOption("occupied");
  await expect(page.locator(".groups-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "Tìm cụm bàn trống" }).click();
  await expect(page.getByText("Chưa có cụm phù hợp")).toBeVisible();
  await page.screenshot({
    path: "test-results/tables-desktop.png",
    fullPage: true,
  });
});

test("Thêm bàn, kết nối, chặn trùng và xóa kết nối khi xóa bàn", async ({
  page,
}) => {
  await page.goto("/#tables");
  await page.getByRole("button", { name: "Thêm bàn", exact: true }).click();
  await page.getByRole("button", { name: "Thêm bàn", exact: true }).click();
  await page.getByLabel("Bàn thứ nhất").selectOption("1");
  await page.getByLabel("Bàn thứ hai").selectOption("2");
  await page.getByRole("button", { name: "Nối bàn", exact: true }).click();
  await expect(page.locator(".edge-chip")).toHaveCount(1);
  await page.getByLabel("Bàn thứ nhất").selectOption("2");
  await page.getByLabel("Bàn thứ hai").selectOption("1");
  await page.getByRole("button", { name: "Nối bàn", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("đã có kết nối");
  await page.getByRole("button", { name: "Xóa bàn 2", exact: true }).click();
  await expect(page.locator(".edge-chip")).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("Báo cáo gọi API thật, áp dụng UTC+7 và kiểm tra kỳ không có dữ liệu", async ({
  page,
}) => {
  await page.goto("/#reports");
  await page.getByRole("button", { name: "Thử với dữ liệu mẫu" }).click();
  const apiRequest = page.waitForRequest((request) =>
    request.url().includes("/reports/most-ordered-menu-item"),
  );
  await page.getByRole("button", { name: "Xem món bán chạy" }).click();
  const payload = (await apiRequest).postDataJSON();
  expect(payload.reportingPeriod.startsAt).toMatch(/18:00:00\+07:00$/);
  await expect(page.locator(".winner-result h2")).toHaveText("iced-latte");
  await expect(page.locator(".winner-result .result-number")).toHaveText("5");
  await page.getByLabel("Từ thời điểm").fill("2026-01-01T00:00");
  await page.getByLabel("Đến trước thời điểm").fill("2026-01-02T00:00");
  await page.getByRole("button", { name: "Xem món bán chạy" }).click();
  await expect(page.getByRole("alert")).toContainText("Không có dòng đơn hàng");
  await expect(page.locator(".winner-result")).toHaveCount(0);
});

test("Tra cứu món và hiển thị không tìm thấy khi mã sai", async ({ page }) => {
  await page.goto("/#menu");
  await page.getByRole("button", { name: "house-coffee", exact: true }).click();
  await page.getByRole("button", { name: "Tra cứu món", exact: true }).click();
  await expect(page.locator(".menu-result h2")).toHaveText("House Coffee");
  await page.getByLabel("Mã món", { exact: true }).fill("not-on-menu");
  await page.getByRole("button", { name: "Tra cứu món", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Không tìm thấy món");
  await expect(page.locator(".menu-result")).toHaveCount(0);
});

test("Giữ bản nháp khi đổi màn hình và tải lại", async ({ page }) => {
  await page.goto("/#billing");
  await page.getByLabel("Tiền món trước giảm giá (VND)").fill("123456");
  await page.getByRole("link", { name: "Kế hoạch bếp", exact: true }).click();
  await page.getByRole("link", { name: "Tính hóa đơn", exact: true }).click();
  await expect(page.getByLabel("Tiền món trước giảm giá (VND)")).toHaveValue(
    "123456",
  );
  await page.reload();
  await expect(page.getByLabel("Tiền món trước giảm giá (VND)")).toHaveValue(
    "123456",
  );
});

test("Số bàn theo nhà hàng và ngăn thêm số bàn trùng", async ({ page }) => {
  await page.goto("/#tables");
  await page.getByLabel("Số bàn mới").fill("101");
  await page.getByRole("button", { name: "Thêm bàn", exact: true }).click();
  await expect(page.locator(".table-symbol")).toContainText("Bàn 101");
  await page.getByLabel("Số bàn mới").fill("101");
  await page.getByRole("button", { name: "Thêm bàn", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("đã có trong danh sách");
  await expect(page.locator(".table-card")).toHaveCount(1);
});

test("Thông báo mất kết nối và cho phép thử lại", async ({ page }) => {
  await page.route("**/health", (route) => route.abort());
  await page.route("**/bills/estimate?**", (route) => route.abort());
  await page.goto("/#billing");
  await expect(page.getByText("Chưa kết nối dịch vụ")).toBeVisible();
  await page.getByLabel("Tiền món trước giảm giá (VND)").fill("100");
  await page.getByRole("button", { name: "Tính hóa đơn", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Không thể kết nối");
  await page.unroute("**/bills/estimate?**");
  await page.getByRole("button", { name: "Tính hóa đơn", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.locator(".bill-total dd")).toBeVisible();
});

test("Các màn hình vừa với điện thoại và không có lỗi JavaScript", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const hash of [
    "overview",
    "tables",
    "billing",
    "kitchen",
    "reports",
    "menu",
  ]) {
    await page
      .getByRole("link", {
        name: {
          overview: "Tổng quan",
          tables: "Bàn & chỗ ngồi",
          billing: "Tính hóa đơn",
          kitchen: "Kế hoạch bếp",
          reports: "Món bán chạy",
          menu: "Tra cứu món",
        }[hash],
        exact: true,
      })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("link", { name: "Tổng quan", exact: true }).click();
  await page.screenshot({
    path: "test-results/overview-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Bàn & chỗ ngồi", exact: true }).click();
  await page.getByRole("button", { name: "Dùng bố trí mẫu 6 bàn" }).click();
  await page.getByRole("button", { name: "Tìm cụm bàn trống" }).click();
  await expect(page.locator(".group-card")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/tables-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Món bán chạy", exact: true }).click();
  await page.getByRole("button", { name: "Thử với dữ liệu mẫu" }).click();
  await page.getByRole("button", { name: "Xem món bán chạy" }).click();
  await expect(page.locator(".winner-result h2")).toHaveText("iced-latte");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/reports-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
