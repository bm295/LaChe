import { request } from "../lib/api";
import { useAction, useDraft } from "../lib/hooks";
import {
  EmptyState,
  Feedback,
  Icon,
  PageHeading,
  Submit,
} from "../components/ui";

type Ingredient = {
  ingredientName: string;
  unitsRequiredPerPortion: string;
  packCount: string;
  unitsPerPack: string;
};
const blank = (): Ingredient => ({
  ingredientName: "",
  unitsRequiredPerPortion: "1",
  packCount: "0",
  unitsPerPack: "1",
});
export function Kitchen() {
  const [ingredients, setIngredients] = useDraft<Ingredient[]>("ingredients", [
    blank(),
    blank(),
  ]);
  const action = useAction<{ maximumPortions: number }>();
  const update = (index: number, field: keyof Ingredient, value: string) =>
    setIngredients(
      ingredients.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    );
  return (
    <>
      <PageHeading
        eyebrow="VẬN HÀNH · CHUẨN BỊ"
        title="Kế hoạch bếp"
        description="Biết chính xác có thể chuẩn bị bao nhiêu phần từ nguyên liệu hiện có."
      />
      <form
        onChange={action.reset}
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(() =>
            request("/recipes/maximum-portions", {
              ingredients: ingredients.map((row) => ({
                ingredientName: row.ingredientName.trim(),
                unitsRequiredPerPortion: Number(row.unitsRequiredPerPortion),
                packCount: Number(row.packCount),
                unitsPerPack: Number(row.unitsPerPack),
              })),
            }),
          );
        }}
      >
        <div className="split-layout kitchen-layout">
          <div className="panel">
            <div className="panel-title">
              <span className="tool-icon kitchen">
                <Icon name="kitchen" />
              </span>
              <div>
                <h2>Công thức & tồn nguyên liệu</h2>
                <p>Dùng cùng đơn vị cho công thức và quy cách gói.</p>
              </div>
            </div>
            <fieldset className="form-fields" disabled={action.busy}>
              <div className="ingredient-header">
                <span>NGUYÊN LIỆU</span>
                <span>MỖI PHẦN</span>
                <span>SỐ GÓI</span>
                <span>ĐƠN VỊ / GÓI</span>
                <span />
              </div>
              {ingredients.map((row, index) => (
                <fieldset className="ingredient-row" key={index}>
                  <legend className="sr-only">Nguyên liệu {index + 1}</legend>
                  <label>
                    <span className="mobile-label">Nguyên liệu</span>
                    <input
                      aria-label="Tên nguyên liệu"
                      required
                      maxLength={100}
                      pattern=".*\S.*"
                      placeholder="Ví dụ: Cà phê"
                      value={row.ingredientName}
                      onChange={(e) =>
                        update(index, "ingredientName", e.target.value)
                      }
                    />
                  </label>
                  {(
                    [
                      ["unitsRequiredPerPortion", "Đơn vị mỗi phần", "1"],
                      ["packCount", "Số gói", "0"],
                      ["unitsPerPack", "Đơn vị mỗi gói", "1"],
                    ] as const
                  ).map(([field, label, min]) => (
                    <label key={field}>
                      <span className="mobile-label">{label}</span>
                      <input
                        aria-label={label}
                        type="number"
                        min={min}
                        step="1"
                        required
                        value={row[field]}
                        onChange={(e) => update(index, field, e.target.value)}
                      />
                    </label>
                  ))}
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label={`Xóa nguyên liệu ${index + 1}`}
                    disabled={ingredients.length === 1}
                    onClick={() => {
                      action.reset();
                      setIngredients(ingredients.filter((_, i) => i !== index));
                    }}
                  >
                    <Icon name="close" size={17} />
                  </button>
                </fieldset>
              ))}
              <button
                className="button dashed"
                type="button"
                onClick={() => {
                  action.reset();
                  setIngredients([...ingredients, blank()]);
                }}
              >
                <Icon name="plus" size={17} />
                Thêm nguyên liệu
              </button>
              <div className="form-footer">
                <span className="muted small">
                  {ingredients.length} nguyên liệu trong công thức
                </span>
                <Submit busy={action.busy}>Tính số phần ăn</Submit>
              </div>
            </fieldset>
            <Feedback error={action.error} />
          </div>
          <aside
            className="panel result-panel"
            aria-live="polite"
            aria-busy={action.busy}
          >
            <p className="eyebrow">KHẢ NĂNG PHỤC VỤ</p>
            {action.result ? (
              <div className="capacity-result">
                <span className="result-number">
                  {action.result.maximumPortions.toLocaleString("vi-VN")}
                </span>
                <h2>phần ăn hoàn chỉnh</h2>
                <p>
                  Nguyên liệu tạo được ít phần nhất quyết định giới hạn phục vụ.
                </p>
                <div className="info-note">
                  Tính từ số gói và quy cách bạn đã nhập. Chưa trừ nguyên liệu
                  khỏi kho.
                </div>
              </div>
            ) : (
              <EmptyState icon="kitchen" title="Sẵn sàng cho ca phục vụ">
                Điền công thức và số gói còn sẵn để tính số phần ăn hoàn chỉnh.
              </EmptyState>
            )}
          </aside>
        </div>
      </form>
      <div className="footnote">
        <Icon name="check" size={18} />
        <p>
          Ví dụ: 3 gói × 24 đơn vị / gói, dùng 2 đơn vị / phần → nguyên liệu này
          đủ cho 36 phần.
        </p>
      </div>
    </>
  );
}
