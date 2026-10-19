import { request } from "../lib/api";
import { useAction, useDraft } from "../lib/hooks";
import {
  EmptyState,
  Feedback,
  Icon,
  PageHeading,
  Submit,
  today,
  toTimestamp,
} from "../components/ui";

type Order = { menuItemId: string; orderedAt: string; quantity: string };
type Draft = { startsAt: string; endsAt: string; orders: Order[] };
export function Reports() {
  const day = today();
  const [draft, setDraft] = useDraft<Draft>("report", {
    startsAt: `${day}T00:00`,
    endsAt: `${day}T23:59`,
    orders: [],
  });
  const action = useAction<{ menuItemId: string; orderedQuantity: number }>();
  const update = (next: Draft) => {
    action.reset();
    setDraft(next);
  };
  const sample = () =>
    update({
      startsAt: `${day}T18:00`,
      endsAt: `${day}T22:00`,
      orders: [
        {
          menuItemId: "house-coffee",
          orderedAt: `${day}T18:10`,
          quantity: "2",
        },
        { menuItemId: "iced-latte", orderedAt: `${day}T18:30`, quantity: "3" },
        { menuItemId: "iced-latte", orderedAt: `${day}T20:15`, quantity: "2" },
      ],
    });
  return (
    <>
      <PageHeading
        eyebrow="VẬN HÀNH · BÁO CÁO"
        title="Món bán chạy"
        description="Tìm món được gọi nhiều nhất trong khoảng thời gian bạn chọn."
        action={<span className="draft-badge">Dữ liệu đơn hàng nhập tay</span>}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(async () => {
            if (draft.startsAt >= draft.endsAt)
              throw new Error("Thời điểm kết thúc phải sau thời điểm bắt đầu.");
            const orders = draft.orders.map((order) => ({
              menuItemId: order.menuItemId.trim(),
              orderedAt: toTimestamp(order.orderedAt),
              quantity: Number(order.quantity),
            }));
            const start = Date.parse(toTimestamp(draft.startsAt)),
              end = Date.parse(toTimestamp(draft.endsAt));
            if (
              !orders.some(
                (order) =>
                  Date.parse(order.orderedAt) >= start &&
                  Date.parse(order.orderedAt) < end,
              )
            )
              throw new Error(
                "Không có dòng đơn hàng nào trong kỳ đã chọn. Hãy điều chỉnh thời gian hoặc thêm dữ liệu.",
              );
            return request("/reports/most-ordered-menu-item", {
              reportingPeriod: {
                startsAt: toTimestamp(draft.startsAt),
                endsAt: toTimestamp(draft.endsAt),
              },
              orders,
            });
          });
        }}
      >
        <div className="split-layout report-layout">
          <div className="panel">
            <fieldset className="form-fields" disabled={action.busy}>
              <div className="panel-title">
                <span className="tool-icon reports">
                  <Icon name="reports" />
                </span>
                <div>
                  <h2>Kỳ báo cáo</h2>
                  <p>Thời gian Việt Nam · UTC+7</p>
                </div>
              </div>
              <div className="two-columns">
                <label>
                  Từ thời điểm
                  <input
                    type="datetime-local"
                    required
                    value={draft.startsAt}
                    onChange={(e) =>
                      update({ ...draft, startsAt: e.target.value })
                    }
                  />
                </label>
                <label>
                  Đến trước thời điểm
                  <input
                    type="datetime-local"
                    required
                    value={draft.endsAt}
                    onChange={(e) =>
                      update({ ...draft, endsAt: e.target.value })
                    }
                  />
                </label>
              </div>
              <p className="muted small">
                Bao gồm thời điểm bắt đầu và loại trừ thời điểm kết thúc.
              </p>
              <div className="section-divider" />
              <div className="panel-title spread">
                <div>
                  <h2>Dòng đơn hàng</h2>
                  <p>Mỗi dòng là một món đã được gọi.</p>
                </div>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() =>
                    update({
                      ...draft,
                      orders: [
                        ...draft.orders,
                        {
                          menuItemId: "",
                          quantity: "1",
                          orderedAt: draft.startsAt,
                        },
                      ],
                    })
                  }
                >
                  <Icon name="plus" size={16} />
                  Thêm dòng
                </button>
              </div>
              {draft.orders.length ? (
                draft.orders.map((order, index) => (
                  <fieldset className="order-row" key={index}>
                    <legend className="sr-only">
                      Dòng đơn hàng {index + 1}
                    </legend>
                    <label>
                      Mã món
                      <input
                        required
                        pattern=".*\S.*"
                        maxLength={120}
                        placeholder="house-coffee"
                        value={order.menuItemId}
                        onChange={(e) =>
                          update({
                            ...draft,
                            orders: draft.orders.map((row, i) =>
                              i === index
                                ? { ...row, menuItemId: e.target.value }
                                : row,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Thời điểm gọi
                      <input
                        required
                        type="datetime-local"
                        value={order.orderedAt}
                        onChange={(e) =>
                          update({
                            ...draft,
                            orders: draft.orders.map((row, i) =>
                              i === index
                                ? { ...row, orderedAt: e.target.value }
                                : row,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Số lượng
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        max="1000000000"
                        value={order.quantity}
                        onChange={(e) =>
                          update({
                            ...draft,
                            orders: draft.orders.map((row, i) =>
                              i === index
                                ? { ...row, quantity: e.target.value }
                                : row,
                            ),
                          })
                        }
                      />
                    </label>
                    <button
                      className="icon-button danger"
                      type="button"
                      aria-label={`Xóa dòng ${index + 1}`}
                      onClick={() =>
                        update({
                          ...draft,
                          orders: draft.orders.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </fieldset>
                ))
              ) : (
                <div className="empty-compact">
                  <p>Chưa có dữ liệu đơn hàng.</p>
                  <button
                    className="button text-button"
                    type="button"
                    onClick={sample}
                  >
                    Thử với dữ liệu mẫu
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
              <div className="form-footer">
                <span className="muted small">
                  {draft.orders.length} dòng · Bản nháp trên trình duyệt
                </span>
                <Submit busy={action.busy}>Xem món bán chạy</Submit>
              </div>
            </fieldset>
            <Feedback error={action.error} />
          </div>
          <aside
            className="panel result-panel"
            aria-live="polite"
            aria-busy={action.busy}
          >
            <p className="eyebrow">MÓN ĐƯỢC YÊU THÍCH NHẤT</p>
            {action.result ? (
              <div className="winner-result">
                <span className="winner-icon">✦</span>
                <span className="status-tag available">Dẫn đầu trong kỳ</span>
                <h2>{action.result.menuItemId}</h2>
                <strong className="result-number">
                  {action.result.orderedQuantity.toLocaleString("vi-VN")}
                </strong>
                <p>phần được gọi</p>
                <div className="info-note">
                  Dựa trên dữ liệu bạn nhập. Nếu bằng số lượng, mã món nhỏ hơn
                  theo thứ tự từ điển được chọn.
                </div>
              </div>
            ) : (
              <EmptyState icon="reports" title="Món nào đang được yêu thích?">
                Chọn kỳ báo cáo, thêm dòng đơn hàng và xem kết quả từ dữ liệu
                của bạn.
              </EmptyState>
            )}
          </aside>
        </div>
      </form>
    </>
  );
}
