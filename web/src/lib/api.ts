export async function request<T>(path: string, payload?: unknown): Promise<T> {
  const base = (
    import.meta.env.VITE_API_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method: payload === undefined ? "GET" : "POST",
      headers:
        payload === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(
      "Không thể kết nối. Kiểm tra kết nối mạng và bảo đảm dịch vụ nhà hàng đang chạy, rồi thử lại.",
    );
  }
  if (!response.ok) {
    if (response.status === 404)
      throw new Error("Không tìm thấy món với mã này. Vui lòng kiểm tra lại.");
    if (response.status >= 500)
      throw new Error(
        "Chưa thể xử lý dữ liệu. Kiểm tra thông tin đã nhập hoặc thử lại sau.",
      );
    const data = await response.json().catch(() => ({}));
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(" · ")
        : (data.message ?? "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu."),
    );
  }
  return response.json() as Promise<T>;
}
