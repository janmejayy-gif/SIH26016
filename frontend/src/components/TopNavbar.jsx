import { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Menu, Search, X, LogOut, User, Settings } from "lucide-react";
import RiskBadge from "./RiskBadge.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { searchProjects } from "../utils/projectUtils.js";
import { useAuth } from "../context/AuthContext.jsx";

const ROUTE_LABELS = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/risk-analysis": "Risk Analysis",
  "/map": "Map",
  "/alerts": "Alerts",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function TopNavbar({ apiOnline, onMenuClick, onOpenProject, userName, userRole, userInitials, userPhotoURL }) {
  const { pathname } = useLocation();
  const currentLabel = ROUTE_LABELS[pathname] || "Dashboard";
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const results = useMemo(() => searchProjects(query).slice(0, 6), [query]);
  const showDropdown = focused && query.trim().length > 0;

  const selectProject = (id) => {
    setQuery("");
    setFocused(false);
    if (onOpenProject) onOpenProject(id);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      // Error handled in AuthContext
    }
    setUserMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <div className="user-chip-wrapper" ref={userMenuRef}>
          <button
            className="user-chip"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            {userPhotoURL ? (
              <img
                className="avatar avatar-img"
                src={userPhotoURL}
                alt=""
                aria-hidden="true"
              />
            ) : (
              <div className="avatar">{userInitials}</div>
            )}
            <div className="user-meta">
              <div className="user-name">{userName}</div>
              <div className="user-role">{userRole}</div>
            </div>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown card" role="menu">
              <div className="user-dropdown-header">
                {userPhotoURL ? (
                  <img className="user-dropdown-avatar" src={userPhotoURL} alt="" aria-hidden="true" />
                ) : (
                  <div className="user-dropdown-avatar placeholder">{userInitials}</div>
                )}
                <div>
                  <div className="user-dropdown-name">{userName}</div>
                  <div className="user-dropdown-email">{user?.email || ""}</div>
                </div>
              </div>
              <div className="user-dropdown-divider" />
              <button className="user-dropdown-item" role="menuitem" onClick={() => navigate("/settings")}>
                <Settings size={15} aria-hidden="true" />
                <span>Settings</span>
              </button>
              <button className="user-dropdown-item" role="menuitem" onClick={() => navigate("/profile")}>
                <User size={15} aria-hidden="true" />
                <span>Profile</span>
              </button>
              <div className="user-dropdown-divider" />
              <button className="user-dropdown-item logout" role="menuitem" onClick={handleLogout}>
                <LogOut size={15} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}