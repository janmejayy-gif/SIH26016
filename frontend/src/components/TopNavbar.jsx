import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronRight, Menu, Search, X } from "lucide-react";
import RiskBadge from "./RiskBadge.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { searchProjects } from "../utils/projectUtils.js";

const ROUTE_LABELS = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/risk-analysis": "Risk Analysis",
  "/map": "Map",
  "/alerts": "Alerts",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function TopNavbar({ apiOnline, onMenuClick, onOpenProject }) {
  const { pathname } = useLocation();
  const currentLabel = ROUTE_LABELS[pathname] || "Dashboard";
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => searchProjects(query).slice(0, 6), [query]);
  const showDropdown = focused && query.trim().length > 0;

  const selectProject = (id) => {
    setQuery("");
    setFocused(false);
    if (onOpenProject) onOpenProject(id);
  };

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
          <span className="status-text">
            {apiOnline ? "API Online" : "API Offline"}
          </span>
        </div>

        <div className="navbar-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search projects, districts..."
            aria-label="Search projects and districts"
            autoComplete="off"
          />
          {query && (
            <button
              className="search-clear"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
          {showDropdown && (
            <div className="search-dropdown card">
              {results.length === 0 ? (
                <div className="search-empty">No matching projects found.</div>
              ) : (
                results.map((project) => (
                  <button
                    key={project.id}
                    className="search-result"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectProject(project.id)}
                  >
                    <span className="search-result-name">{project.name}</span>
                    <span className="search-result-meta">
                      {project.id} · {project.district}, {project.state}
                    </span>
                    <RiskBadge level={project.risk} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <NotificationDropdown onOpenProject={onOpenProject} />

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