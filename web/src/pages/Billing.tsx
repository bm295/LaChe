import { request } from "../lib/api";
import { useAction, useDraft } from "../lib/hooks";
import {
  EmptyState,
  Feedback,
  Icon,
  money,
  PageHeading,
  Submit,
} from "../components/ui";

type Bill = {
  subtotal: number;
  discount: number;
  serviceCharge: number;
  vat: number;
  total: number;
};
export function Billing() {
  const [draft, setDraft] = useDraft("bill", {
    subtotal: "",
    discountPercent: "0",
    maximumDiscount: "0",
  });
  const action = useAction<Bill>();
  return (
    <>
      <PageHeading
        eyebrow="PHỤC VỤ · THU NGÂN"
        title="Tính hóa đơn"
        description="Kiểm tra số tiền trước khi gửi đến khách."
      />
      <form
        className="split-layout"
        onChange={action.reset}
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(() =>
            request<Bill>(
              `/bills/estimate?${new URLSearchParams({ subtotal: draft.subtotal, discountRate: String(Number(draft.discountPercent) / 100), maximumDiscount: draft.maximumDiscount })}`,
            ),
          );
        }}
      >
        <div className="panel">
          <div className="panel-title">
            <span className="tool-icon billing">
              <Icon name="bill" />
            </span>
            <div>
              <h2>Thông tin thanh toán</h2>
              <p>Nhập giá trị món và ưu đãi áp dụng.</p>
            </div>
          </div>
          <fieldset disabled={action.busy} className="form-fields">
            <label>
              Tiền món trước giảm giá (VND)
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="Ví dụ: 1.000.000"
                value={draft.subtotal}
                onChange={(e) =>
                  setDraft({ ...draft, subtotal: e.target.value })
                }
              />
            </label>
            <div className="two-columns">
              <label>
                Giảm giá (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  value={draft.discountPercent}
                  onChange={(e) =>
                    setDraft({ ...draft, discountPercent: e.target.value })
                  }
                />
              </label>
              <label>
                Giảm tối đa (VND)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={draft.maximumDiscount}
                  onChange={(e) =>
                    setDraft({ ...draft, maximumDiscount: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="info-note">
              <Icon name="check" size={18} />
              <p>
                Giảm giá được giới hạn ở mức tối đa. Đặt mức này lớn hơn 0 để áp
                dụng ưu đãi.
              </p>
            </div>
            <div className="rate-list">
              <span>
                Phí phục vụ <strong>10%</strong>
              </span>
              <span>
                Thuế VAT <strong>8%</strong>
              </span>
            </div>
            <p className="muted small">
              Phí phục vụ tính sau giảm giá. VAT tính trên tiền món đã giảm cộng
              phí phục vụ.
            </p>
            <Submit busy={action.busy}>Tính hóa đơn</Submit>
          </fieldset>
          <Feedback error={action.error} />
        </div>
        <aside
          className="receipt panel"
          aria-live="polite"
          aria-busy={action.busy}
        >
          <div className="receipt-brand">
            La Cheminée<span>PHIẾU ƯỚC TÍNH THANH TOÁN</span>
          </div>
          {action.result ? (
            <>
              <dl className="bill-lines">
                {[
                  ["Tiền món", action.result.subtotal],
                  ["Giảm giá", -action.result.discount],
                  ["Phí phục vụ · 10%", action.result.serviceCharge],
                  ["VAT · 8%", action.result.vat],
                ].map(([label, amount]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{money(Number(amount))}</dd>
                  </div>
                ))}
                <div className="bill-total">
                  <dt>Tổng thanh toán</dt>
                  <dd>{money(action.result.total)}</dd>
                </div>
              </dl>
              <p className="receipt-thanks">
                Cảm ơn bạn đã chọn La Cheminée.
                <span>Đây là bản ước tính, chưa ghi nhận thanh toán.</span>
              </p>
            </>
          ) : (
            <EmptyState icon="bill" title="Hóa đơn sẽ xuất hiện tại đây">
              Nhập thông tin bên cạnh và chọn “Tính hóa đơn” để xem chi tiết.
            </EmptyState>
          )}
        </aside>
      </form>
    </>
  );
}
