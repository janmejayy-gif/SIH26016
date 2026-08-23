import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Map,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Monitor",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/risk-analysis", label: "Risk Analysis", icon: ShieldAlert },
      { to: "/map", label: "Map", icon: Map },
      { to: "/alerts", label: "Alerts", icon: Bell },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-backdrop${open ? " show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Primary">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <path d="M20 16v26h18v6H13V16h7z" fill="white" />
              <rect x="36" y="28" width="7" height="20" fill="#9dc0ff" />
              <rect x="46" y="20" width="7" height="28" fill="white" />
            </svg>
          </div>
          <div>
            <div className="brand-name">
              Land Acquisition
              <br />
              Delay Intelligence
            </div>
            <div className="brand-sub">LADI Portal · Decision Support</div>
          </div>
        </div>

        <nav className="nav-scroll">
          {NAV_SECTIONS.map((section) => (
            <div className="nav-group" key={section.label}>
              <div className="nav-group-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item${isActive ? " active" : ""}`
                  }
                  onClick={onClose}
                >
                  <item.icon size={17} strokeWidth={2} aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">V0.1.0 · PHASE 1 BUILD</div>
      </aside>
    </>
  );
}
