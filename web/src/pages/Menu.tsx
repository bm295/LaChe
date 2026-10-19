import { request } from "../lib/api";
import { useAction, useDraft } from "../lib/hooks";
import {
  EmptyState,
  Feedback,
  Icon,
  PageHeading,
  Submit,
} from "../components/ui";

export function Menu() {
  const [id, setId] = useDraft("menu-id", "");
  const action = useAction<{ id: string; name: string; price: number }>();
  return (
    <>
      <PageHeading
        eyebrow="PHỤC VỤ · THỰC ĐƠN"
        title="Tra cứu món"
        description="Tìm nhanh thông tin một món theo mã trên thực đơn."
      />
      <div className="split-layout">
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            void action.run(() =>
              request(`/menu/${encodeURIComponent(id.trim())}`),
            );
          }}
        >
          <div className="panel-title">
            <span className="tool-icon menu">
              <Icon name="menu" />
            </span>
            <div>
              <h2>Thông tin món</h2>
              <p>Nhập mã chính xác để tra cứu.</p>
            </div>
          </div>
          <fieldset className="form-fields" disabled={action.busy}>
            <label>
              Mã món
              <input
                required
                pattern=".*\S.*"
                maxLength={120}
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Ví dụ: house-coffee"
                value={id}
                onChange={(e) => {
                  action.reset();
                  setId(e.target.value);
                }}
              />
            </label>
            <p className="muted small">
              Món mẫu hiện có:{" "}
              <button
                className="inline-button"
                type="button"
                onClick={() => {
                  action.reset();
                  setId("house-coffee");
                }}
              >
                house-coffee
              </button>
            </p>
            <Submit busy={action.busy}>Tra cứu món</Submit>
          </fieldset>
          <Feedback error={action.error} />
        </form>
        <aside
          className="panel result-panel"
          aria-live="polite"
          aria-busy={action.busy}
        >
          {action.result ? (
            <div className="menu-result">
              <span className="menu-visual">
                <Icon name="menu" size={56} />
                <span>LA CHEMINÉE</span>
              </span>
              <p className="eyebrow">THÔNG TIN THỰC ĐƠN</p>
              <h2>{action.result.name}</h2>
              <span className="code-chip">{action.result.id}</span>
              <dl className="bill-lines">
                <div>
                  <dt>Giá niêm yết</dt>
                  <dd>{action.result.price.toLocaleString("vi-VN")}</dd>
                </div>
              </dl>
              <p className="muted small">
                Thực đơn hiện chưa cung cấp đơn vị tiền tệ cho giá món.
              </p>
            </div>
          ) : (
            <EmptyState icon="menu" title="Khám phá từ một mã món">
              Tên món và giá niêm yết sẽ xuất hiện sau khi tra cứu.
            </EmptyState>
          )}
        </aside>
      </div>
    </>
  );
}
