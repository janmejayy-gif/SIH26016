import { useLocation } from "react-router-dom";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";

const ROUTE_LABELS = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/risk-analysis": "Risk Analysis",
  "/map": "Map",
  "/alerts": "Alerts",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function TopNavbar({ apiOnline, onMenuClick }) {
  const { pathname } = useLocation();
  const currentLabel = ROUTE_LABELS[pathname] || "Dashboard";

  return (
    <header className="topnavbar">
      <button
        className="icon-btn menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
      >
        <Menu size={19} />
      </button>

      <nav className="crumb" aria-label="Breadcrumb">
        <span>LADI Portal</span>
        <ChevronRight size={13} className="crumb-sep" aria-hidden="true" />
        <span className="crumb-current">{currentLabel}</span>
      </nav>

      <div className="navbar-right">
        <div
          className={`status-pill${apiOnline ? "" : " offline"}`}
          role="status"
        >
          <span className="status-dot" aria-hidden="true" />
          <span className="status-text">{apiOnline ? "API Online" : "API Offline"}</span>
        </div>

        <label className="navbar-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search projects, districts..."
            aria-label="Search projects and districts"
          />
        </label>

        <button className="icon-btn" aria-label="Notifications (5 unread)">
          <Bell size={18} />
          <span className="badge-dot">5</span>
        </button>

        <div className="user-chip">
          <div className="avatar">AD</div>
          <div className="user-meta">
            <div className="user-name">A. Deshmukh</div>
            <div className="user-role">Acquisition Officer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
