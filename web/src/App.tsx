import { useEffect, useState } from "react";
import { Icon, type IconName } from "./components/ui";
import { request } from "./lib/api";
import { Overview } from "./pages/Overview";
import { Billing } from "./pages/Billing";
import { Kitchen } from "./pages/Kitchen";
import { Tables } from "./pages/Tables";
import { Reports } from "./pages/Reports";
import { Menu } from "./pages/Menu";

const navigation: {
  id: string;
  label: string;
  icon: IconName;
  section: string;
}[] = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: "overview",
    section: "Không gian làm việc",
  },
  { id: "tables", label: "Bàn & chỗ ngồi", icon: "tables", section: "Phục vụ" },
  { id: "billing", label: "Tính hóa đơn", icon: "bill", section: "Phục vụ" },
  { id: "menu", label: "Tra cứu món", icon: "menu", section: "Phục vụ" },
  {
    id: "kitchen",
    label: "Kế hoạch bếp",
    icon: "kitchen",
    section: "Vận hành",
  },
  {
    id: "reports",
    label: "Món bán chạy",
    icon: "reports",
    section: "Vận hành",
  },
];
export function App() {
  const [active, setActive] = useState(() =>
    navigation.some((item) => item.id === location.hash.slice(1))
      ? location.hash.slice(1)
      : "overview",
  );
  const [health, setHealth] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  useEffect(() => {
    let mounted = true;
    const check = () =>
      request<{ status: string }>("/health")
        .then((data) => {
          if (mounted) setHealth(data.status === "ok" ? "online" : "offline");
        })
        .catch(() => {
          if (mounted) setHealth("offline");
        });
    void check();
    const timer = setInterval(check, 30000);
    const onHash = () =>
      setActive(
        navigation.some((item) => item.id === location.hash.slice(1))
          ? location.hash.slice(1)
          : "overview",
      );
    window.addEventListener("hashchange", onHash);
    return () => {
      mounted = false;
      clearInterval(timer);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  const navigate = (id: string) => {
    setActive(id);
    location.hash = id;
    window.scrollTo({ top: 0 });
  };
  const selected = navigation.find((item) => item.id === active)!;
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Đến nội dung chính
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#overview"
          onClick={() => navigate("overview")}
        >
          <span className="brand-mark">
            lc<span>✦</span>
          </span>
          <span>
            La Cheminée<small>RESTAURANT WORKSPACE</small>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-monogram">LC</span>
          <div>
            Không gian nhà hàng<small>Vận hành mỗi ngày</small>
          </div>
        </div>
        <nav aria-label="Điều hướng chính">
          {navigation.map((item, index) => (
            <div key={item.id}>
              {(index === 0 ||
                item.section !== navigation[index - 1].section) && (
                <p className="nav-label">{item.section}</p>
              )}
              <a
                href={`#${item.id}`}
                className={`nav-item ${active === item.id ? "active" : ""}`}
                aria-current={active === item.id ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                <Icon name={item.icon} />
                {item.label}
                {active === item.id && <span className="nav-dot" />}
              </a>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="small-star">✦</span>
          <p>
            Chăm chút từng chi tiết.
            <br />
            <strong>Trọn vẹn mỗi bữa ăn.</strong>
          </p>
          <div className="team-profile">
            <span className="avatar">LC</span>
            <div>
              Đội ngũ nhà hàng<small>Không gian vận hành</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            La Cheminée <span>/</span> <strong>{selected.label}</strong>
          </div>
          <div className={`connection ${health}`}>
            <span />
            {health === "online"
              ? "Dịch vụ sẵn sàng"
              : health === "offline"
                ? "Chưa kết nối dịch vụ"
                : "Đang kết nối…"}
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <section hidden={active !== "overview"} aria-label="Tổng quan">
            <Overview navigate={navigate} />
          </section>
          <section hidden={active !== "tables"} aria-label="Bàn và chỗ ngồi">
            <Tables />
          </section>
          <section hidden={active !== "billing"} aria-label="Tính hóa đơn">
            <Billing />
          </section>
          <section hidden={active !== "kitchen"} aria-label="Kế hoạch bếp">
            <Kitchen />
          </section>
          <section hidden={active !== "reports"} aria-label="Món bán chạy">
            <Reports />
          </section>
          <section hidden={active !== "menu"} aria-label="Tra cứu món">
            <Menu />
          </section>
        </main>
        <footer className="app-footer">
          <span>
            La Cheminée <span className="footer-star">✦</span> Không gian dành
            cho những bữa ăn ngon.
          </span>
          <span>Restaurant workspace</span>
        </footer>
      </div>
    </div>
  );
}
