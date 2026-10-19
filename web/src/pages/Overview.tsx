import { Icon, PageHeading, type IconName } from "../components/ui";

const tools: {
  id: string;
  number: string;
  icon: IconName;
  title: string;
  description: string;
  action: string;
}[] = [
  {
    id: "tables",
    number: "01",
    icon: "tables",
    title: "Sắp xếp chỗ ngồi",
    description:
      "Kiểm tra bàn trống và tìm các cụm bàn có thể kết nối cho nhóm khách.",
    action: "Xem bàn & chỗ ngồi",
  },
  {
    id: "billing",
    number: "02",
    icon: "bill",
    title: "Tính toán rõ ràng",
    description:
      "Ước tính hóa đơn với giảm giá có mức trần, phí phục vụ và VAT.",
    action: "Tính hóa đơn",
  },
  {
    id: "kitchen",
    number: "03",
    icon: "kitchen",
    title: "Chuẩn bị vừa đủ",
    description:
      "Tính số phần ăn có thể phục vụ từ công thức và nguyên liệu sẵn có.",
    action: "Lập kế hoạch bếp",
  },
  {
    id: "reports",
    number: "04",
    icon: "reports",
    title: "Hiểu khẩu vị khách",
    description:
      "Tìm món được gọi nhiều nhất từ dữ liệu đơn hàng trong ca, ngày hoặc tuần.",
    action: "Xem món bán chạy",
  },
];
export function Overview({ navigate }: { navigate: (id: string) => void }) {
  const date = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return (
    <>
      <PageHeading
        eyebrow="MỖI NGÀY, MỘT TRẢI NGHIỆM TỐT HƠN"
        title="Chào một ngày phục vụ tốt."
        description="Mọi công cụ cần thiết, trong một không gian gọn gàng."
        action={<span className="date-chip">{date}</span>}
      />
      <div className="welcome-banner">
        <div className="welcome-copy">
          <span className="banner-tag">LA CHEMINÉE · TỪ BẾP ĐẾN BÀN</span>
          <h2>
            Chăm chút vận hành.
            <br />
            Thảnh thơi đón khách.
          </h2>
          <p>
            Bắt đầu với bàn trống, chuẩn bị nguyên liệu và
            <br className="desktop-break" /> để mỗi lượt phục vụ diễn ra thật
            suôn sẻ.
          </p>
          <button className="button cream" onClick={() => navigate("tables")}>
            Chuẩn bị chỗ ngồi <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="table-illustration" aria-hidden="true">
          <div className="illustration-caption">THE ART OF HOSPITALITY</div>
          <div className="plate">
            <div className="plate-rim">
              <span>✦</span>
            </div>
          </div>
          <div className="fork">
            <i />
            <i />
            <i />
            <b />
          </div>
          <div className="knife" />
          <div className="glass" />
          <div className="napkin" />
          <div className="herb">⌁</div>
        </div>
      </div>
      <div className="section-title">
        <div>
          <p className="eyebrow">CÔNG VIỆC HẰNG NGÀY</p>
          <h2>Hôm nay, bạn cần làm gì?</h2>
        </div>
        <span className="muted">Từ đón khách đến chuẩn bị bếp</span>
      </div>
      <div className="tool-grid">
        {tools.map((tool) => (
          <button
            className="tool-card"
            key={tool.id}
            onClick={() => navigate(tool.id)}
          >
            <div className="tool-top">
              <span className={`tool-icon ${tool.id}`}>
                <Icon name={tool.icon} size={25} />
              </span>
              <span className="tool-number">{tool.number}</span>
            </div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
            <span className="tool-link">
              {tool.action}
              <Icon name="arrow" size={18} />
            </span>
          </button>
        ))}
      </div>
      <div className="overview-bottom">
        <div className="menu-callout">
          <Icon name="menu" size={27} />
          <div>
            <h3>Một món ăn, mọi thông tin.</h3>
            <p>Tra cứu tên và giá niêm yết theo mã món.</p>
          </div>
          <button className="button secondary" onClick={() => navigate("menu")}>
            Tra cứu thực đơn
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="draft-note">
          <span>✦</span>
          <p>
            <strong>Tiếp tục công việc của bạn</strong>Dữ liệu nhập được giữ
            trên trình duyệt này để tiện quay lại. Các phép tính không tạo đơn
            hàng hay đặt bàn.
          </p>
        </div>
      </div>
    </>
  );
}
