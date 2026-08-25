import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import TopNavbar from "../components/TopNavbar.jsx";
import ProjectDetailPanel from "../components/ProjectDetailPanel.jsx";
import { checkHealth } from "../services/api.js";
import { ProfileProvider, useProfile } from "../context/ProfileContext.jsx";
import { ThemeProvider } from "../context/ThemeContext.jsx";

function MainLayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [detailProjectId, setDetailProjectId] = useState(null);
  const location = useLocation();

  const refreshHealth = useCallback(async () => {
    try {
      await checkHealth();
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const openProject = useCallback((id) => {
    if (!id) return;
    setDetailProjectId(id);
  }, []);

  const closeProject = useCallback(() => setDetailProjectId(null), []);

  const { profile, initials } = useProfile();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <TopNavbar
          apiOnline={apiOnline}
          onMenuClick={() => setSidebarOpen((open) => !open)}
          onOpenProject={openProject}
          userName={profile.name}
          userRole={profile.role}
          userInitials={initials}
        />
        <main className="page-content">
          <Outlet context={{ apiOnline, refreshHealth, openProject }} />
        </main>
        <footer className="page-footer" style={{ margin: "0 28px 22px" }}>
          <span>
            © 2026 Department of Land Resources · Ministry of Rural Development
          </span>
          <span>LADI Portal · Mock data for demonstration only</span>
        </footer>
      </div>
      <ProjectDetailPanel projectId={detailProjectId} onClose={closeProject} />
    </div>
  );
}

export default function MainLayout() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <MainLayoutInner />
      </ProfileProvider>
    </ThemeProvider>
  );
}
