import type { ReactNode } from "react";

export type IconName =
  | "overview"
  | "tables"
  | "bill"
  | "kitchen"
  | "reports"
  | "menu"
  | "arrow"
  | "plus"
  | "close"
  | "check";
const paths: Record<IconName, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  tables: (
    <>
      <rect x="5" y="7" width="14" height="10" rx="2" />
      <path d="M8 3v4m8-4v4M8 17v4m8-4v4M1 10h4m14 0h4M1 14h4m14 0h4" />
    </>
  ),
  bill: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 7h6M9 11h6m-6 4h3" />
    </>
  ),
  kitchen: (
    <>
      <path d="M7 14a5 5 0 0 1-2-9 5 5 0 0 1 7-2 5 5 0 0 1-2 9v7H7v-7Zm0 3h10" />
    </>
  ),
  reports: (
    <>
      <path d="M4 3v18h17M8 16v-5m5 5V7m5 9v-8" />
    </>
  ),
  menu: (
    <>
      <path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Feedback({ error }: { error: string }) {
  return error ? (
    <div role="alert" className="error">
      <strong>Chưa thể hoàn tất</strong>
      <p>{error}</p>
    </div>
  ) : null;
}
export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Submit({
  busy,
  children,
}: {
  busy: boolean;
  children: ReactNode;
}) {
  return (
    <button className="button primary" type="submit" disabled={busy}>
      {busy ? (
        <>
          <span className="spinner" />
          Đang xử lý…
        </>
      ) : (
        <>
          {children}
          <Icon name="arrow" size={18} />
        </>
      )}
    </button>
  );
}
export const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 2,
  }).format(value);
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const toTimestamp = (value: string) =>
  `${value.length === 16 ? `${value}:00` : value}+07:00`;
