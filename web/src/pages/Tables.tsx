import { useState } from "react";
import { request } from "../lib/api";
import { useAction, useDraft } from "../lib/hooks";
import {
  EmptyState,
  Feedback,
  Icon,
  PageHeading,
  Submit,
} from "../components/ui";

type Status = "available" | "occupied" | "reserved";
type Table = { number: number; area: string; capacity: number; status: Status };
type Connection = { from: number; to: number };
type Layout = { tables: Table[]; connections: Connection[] };
type Group = { tableNumbers: number[]; totalCapacity: number };
const statuses: { value: Status; label: string }[] = [
  { value: "available", label: "Trống" },
  { value: "occupied", label: "Có khách" },
  { value: "reserved", label: "Đã đặt" },
];
export function Tables() {
  const [layout, setLayout] = useDraft<Layout>("layout", {
    tables: [],
    connections: [],
  });
  const [edge, setEdge] = useState({ from: "", to: "" });
  const [partySize, setPartySize] = useState("1");
  const [edgeError, setEdgeError] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [tableError, setTableError] = useState("");
  const action = useAction<{ groups: Group[] }>();
  const update = (next: Layout) => {
    action.reset();
    setEdgeError("");
    setLayout(next);
  };
  const changeTable = (number: number, values: Partial<Table>) =>
    update({
      ...layout,
      tables: layout.tables.map((t) =>
        t.number === number ? { ...t, ...values } : t,
      ),
    });
  const addTable = () => {
    const number =
      newNumber === ""
        ? Math.max(0, ...layout.tables.map((t) => t.number)) + 1
        : Number(newNumber);
    if (!Number.isSafeInteger(number) || number <= 0) {
      setTableError("Số bàn phải là số nguyên dương hợp lệ.");
      return;
    }
    if (layout.tables.some((table) => table.number === number)) {
      setTableError("Số bàn này đã có trong danh sách.");
      return;
    }
    setTableError("");
    setNewNumber("");
    update({
      ...layout,
      tables: [
        ...layout.tables,
        {
          number,
          area: "Tầng trệt",
          capacity: 2,
          status: "available",
        },
      ],
    });
  };
  const loadSample = () =>
    update({
      tables: [1, 2, 3, 4, 5, 6].map((number) => ({
        number,
        area: number < 5 ? "Tầng trệt" : "Sân vườn",
        capacity: number % 2 === 0 ? 4 : 2,
        status:
          number === 3 ? "occupied" : number === 6 ? "reserved" : "available",
      })),
      connections: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 5, to: 6 },
      ],
    });
  const visibleGroups = action.result?.groups.filter(
    (group) => group.totalCapacity >= Number(partySize || 1),
  );
  return (
    <>
      <PageHeading
        eyebrow="PHỤC VỤ · CHỖ NGỒI"
        title="Bàn & chỗ ngồi"
        description="Chuẩn bị danh sách bàn và tìm cụm bàn trống cho nhóm khách."
        action={<span className="draft-badge">Bản nháp trên trình duyệt</span>}
      />
      <div className="stats-grid">
        {[
          {
            label: "Bàn trong bản nháp",
            count: layout.tables.length,
            style: "",
          },
          ...statuses.map((status) => ({
            label: status.label,
            count: layout.tables.filter((t) => t.status === status.value)
              .length,
            style: status.value,
          })),
        ].map((stat) => (
          <div className={`stat-card ${stat.style}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.count.toString().padStart(2, "0")}</strong>
            <span className="stat-dot" />
          </div>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(() => request("/tables/available-groups", layout));
        }}
      >
        <fieldset className="form-fields" disabled={action.busy}>
          <div className="panel">
            <div className="panel-title spread">
              <div>
                <h2>Danh sách bàn</h2>
                <p>Điều chỉnh trạng thái theo tình hình phục vụ thực tế.</p>
              </div>
              <div className="table-toolbar">
                <label className="sr-only" htmlFor="new-table-number">
                  Số bàn mới
                </label>
                <input
                  id="new-table-number"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Số bàn"
                  value={newNumber}
                  onChange={(event) => {
                    setNewNumber(event.target.value);
                    setTableError("");
                  }}
                />
                <button
                  className="button secondary"
                  type="button"
                  onClick={addTable}
                >
                  <Icon name="plus" size={16} />
                  Thêm bàn
                </button>
              </div>
            </div>
            <Feedback error={tableError} />
            {layout.tables.length === 0 ? (
              <>
                <EmptyState icon="tables" title="Bắt đầu với bàn đầu tiên">
                  Thêm bàn của nhà hàng hoặc dùng bố trí mẫu để thử tính năng.
                </EmptyState>
                <div className="center">
                  <button
                    className="button text-button"
                    type="button"
                    onClick={loadSample}
                  >
                    Dùng bố trí mẫu 6 bàn
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="table-grid">
                {layout.tables.map((table) => (
                  <article
                    className={`table-card ${table.status}`}
                    key={table.number}
                  >
                    <div className="table-card-top">
                      <span className={`status-tag ${table.status}`}>
                        {statuses.find((s) => s.value === table.status)?.label}
                      </span>
                      <button
                        className="icon-button danger"
                        type="button"
                        aria-label={`Xóa bàn ${table.number}`}
                        onClick={() =>
                          update({
                            tables: layout.tables.filter(
                              (t) => t.number !== table.number,
                            ),
                            connections: layout.connections.filter(
                              (e) =>
                                e.from !== table.number &&
                                e.to !== table.number,
                            ),
                          })
                        }
                      >
                        <Icon name="close" size={15} />
                      </button>
                    </div>
                    <div className="table-symbol">
                      <Icon name="tables" size={38} />
                      <strong>
                        Bàn {String(table.number).padStart(2, "0")}
                      </strong>
                    </div>
                    <div className="two-columns table-inputs">
                      <label>
                        Khu vực
                        <input
                          aria-label={`Khu vực bàn ${table.number}`}
                          required
                          pattern=".*\S.*"
                          maxLength={80}
                          value={table.area}
                          onChange={(e) =>
                            changeTable(table.number, { area: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Số chỗ
                        <input
                          aria-label={`Số chỗ bàn ${table.number}`}
                          required
                          type="number"
                          min="1"
                          step="1"
                          max="10000"
                          value={table.capacity || ""}
                          onChange={(e) =>
                            changeTable(table.number, {
                              capacity: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                    <label
                      className="sr-only"
                      htmlFor={`status-${table.number}`}
                    >
                      Trạng thái bàn {table.number}
                    </label>
                    <select
                      id={`status-${table.number}`}
                      value={table.status}
                      onChange={(e) =>
                        changeTable(table.number, {
                          status: e.target.value as Status,
                        })
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>
            )}
          </div>
          {layout.tables.length > 0 && (
            <div className="panel connection-panel">
              <div className="panel-title">
                <div>
                  <h2>Kết nối được phép ghép</h2>
                  <p>
                    Chỉ nối những bàn có thể ghép trực tiếp. Cùng khu vực chưa
                    có nghĩa là liền nhau.
                  </p>
                </div>
              </div>
              <div className="edge-editor">
                <label>
                  Bàn thứ nhất
                  <select
                    value={edge.from}
                    onChange={(e) => {
                      setEdgeError("");
                      setEdge({ ...edge, from: e.target.value });
                    }}
                  >
                    <option value="">Chọn bàn</option>
                    {layout.tables.map((t) => (
                      <option key={t.number} value={t.number}>
                        Bàn {t.number}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="edge-symbol">↔</span>
                <label>
                  Bàn thứ hai
                  <select
                    value={edge.to}
                    onChange={(e) => {
                      setEdgeError("");
                      setEdge({ ...edge, to: e.target.value });
                    }}
                  >
                    <option value="">Chọn bàn</option>
                    {layout.tables.map((t) => (
                      <option key={t.number} value={t.number}>
                        Bàn {t.number}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="button secondary"
                  type="button"
                  disabled={!edge.from || !edge.to}
                  onClick={() => {
                    const from = Number(edge.from),
                      to = Number(edge.to);
                    if (
                      !layout.tables.some((t) => t.number === from) ||
                      !layout.tables.some((t) => t.number === to)
                    ) {
                      setEdgeError("Hãy chọn hai bàn hiện có.");
                      return;
                    }
                    if (from === to) {
                      setEdgeError("Hãy chọn hai bàn khác nhau.");
                      return;
                    }
                    if (
                      layout.connections.some(
                        (e) =>
                          (e.from === from && e.to === to) ||
                          (e.from === to && e.to === from),
                      )
                    ) {
                      setEdgeError("Hai bàn này đã có kết nối.");
                      return;
                    }
                    update({
                      ...layout,
                      connections: [...layout.connections, { from, to }],
                    });
                    setEdge({ from: "", to: "" });
                  }}
                >
                  <Icon name="plus" size={16} />
                  Nối bàn
                </button>
              </div>
              {edgeError && (
                <p className="inline-error" role="alert">
                  {edgeError}
                </p>
              )}
              <div className="edge-list">
                {layout.connections.length ? (
                  layout.connections.map((connection, index) => (
                    <span
                      className="edge-chip"
                      key={`${connection.from}-${connection.to}`}
                    >
                      Bàn {connection.from} <span>↔</span> Bàn {connection.to}
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Xóa kết nối ${connection.from} và ${connection.to}`}
                        onClick={() =>
                          update({
                            ...layout,
                            connections: layout.connections.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="muted small">
                    Chưa có kết nối. Mỗi bàn trống sẽ tạo thành một cụm riêng.
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="form-footer">
            <p className="muted small">
              Thay đổi chỉ được lưu trên trình duyệt này, chưa đặt hay cập nhật
              bàn trên hệ thống.
            </p>
            <Submit busy={action.busy}>Tìm cụm bàn trống</Submit>
          </div>
        </fieldset>
        <Feedback error={action.error} />
      </form>
      {action.result && (
        <div className="panel groups-panel" aria-live="polite">
          <div className="panel-title spread">
            <div>
              <h2>Cụm bàn trống</h2>
              <p>{action.result.groups.length} cụm từ bố trí vừa tính</p>
            </div>
            <label className="party-filter">
              Nhóm khách
              <input
                type="number"
                min="1"
                step="1"
                max="10000"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
              />
              <span>người</span>
            </label>
          </div>
          {visibleGroups?.length ? (
            <div className="group-grid">
              {visibleGroups.map((group) => (
                <div className="group-card" key={group.tableNumbers.join("-")}>
                  <Icon name="tables" size={24} />
                  <div>
                    <h3>
                      {group.tableNumbers.map((n) => `Bàn ${n}`).join(" + ")}
                    </h3>
                    <p>{group.tableNumbers.length} bàn có kết nối</p>
                  </div>
                  <strong>
                    {group.totalCapacity}
                    <small>chỗ</small>
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="tables" title="Chưa có cụm phù hợp">
              Không có cụm bàn trống đáp ứng số khách đã chọn. Hãy kiểm tra
              trạng thái và kết nối bàn.
            </EmptyState>
          )}
          <p className="muted small">
            Tổng chỗ ngồi chỉ giúp chọn nhóm ứng viên. Cần kiểm tra lối đi và
            khả năng ghép thực tế trước khi đón khách.
          </p>
        </div>
      )}
    </>
  );
}
