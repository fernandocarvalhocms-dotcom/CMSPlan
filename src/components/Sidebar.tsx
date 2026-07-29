const items = [
  {
    id: "dashboard",
    label: "Visão executiva",
    icon: "fa-chart-line",
  },
  {
    id: "projects",
    label: "Obras",
    icon: "fa-building",
  },
  {
    id: "schedule",
    label: "Cronograma",
    icon: "fa-calendar-days",
  },
  {
    id: "balance",
    label: "Linha de balanço",
    icon: "fa-chart-gantt",
  },
  {
    id: "lean",
    label: "Lean / Lookahead",
    icon: "fa-arrows-rotate",
  },
  {
    id: "cost",
    label: "Custos e EVM",
    icon: "fa-sack-dollar",
  },
  {
    id: "risk",
    label: "Riscos",
    icon: "fa-triangle-exclamation",
  },
  {
    id: "report",
    label: "Relatórios",
    icon: "fa-file-lines",
  },
  {
    id: "ai",
    label: "CMS Intelligence",
    icon: "fa-brain",
  },
];

type SidebarProps = {
  active: string;
  onChange: (value: string) => void;
};

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src="/logo.svg"
          alt="CMS Engenharia"
          className="cms-logo"
        />

        <div className="brand-text">
          <strong>CMSPlan</strong>
          <span>Powered by CMS Engenharia</span>
        </div>
      </div>

      <div className="sidebar-section-label">NAVEGAÇÃO</div>      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`sidebar-link ${
              active === item.id ? "active" : ""
            }`}
            onClick={() => onChange(item.id)}
          >
            <i
              className={`fa-solid ${item.icon} sidebar-icon`}
              aria-hidden="true"
            />

            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">FC</div>

        <div className="user-details">
          <strong>Fernando Carvalho</strong>
          <span>Administrador</span>
        </div>

        <i
          className="fa-solid fa-chevron-right footer-arrow"
          aria-hidden="true"
        />
      </div>
    </aside>
  );
}