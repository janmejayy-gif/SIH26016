import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const INITIAL_SETTINGS = [
  {
    id: "criticalAlerts",
    name: "Critical alert notifications",
    description:
      "Push notifications when any project crosses the 85% predicted delay threshold.",
    enabled: true,
  },
  {
    id: "weeklyDigest",
    name: "Weekly portfolio digest",
    description:
      "Summary of risk movements across all monitored states every Monday.",
    enabled: true,
  },
  {
    id: "escalationEmails",
    name: "Escalation emails to review board",
    description:
      "Automatically notify the state review board when projects are escalated.",
    enabled: false,
  },
];

export default function Settings() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const { profile, updateProfile, saveMessage } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const [officerName, setOfficerName] = useState(profile.name);
  const [deptName, setDeptName] = useState(profile.department);
  const [designation, setDesignation] = useState(profile.role);

  useEffect(() => {
    document.title = "Settings · LADI Portal";
  }, []);

  const toggle = (id) =>
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );

  const handleSave = () => {
    updateProfile({ name: officerName, department: deptName, role: designation });
  };

  return (
    <>
      <PageHeader
        title="System Settings"
        subtitle="Notification preferences and portal configuration for your account."
      >
        <span className="module-tag">Phase 1 Module</span>
      </PageHeader>

      <SectionHeader
        title="Notifications"
        subtitle="Mock preference controls — persistence arrives with Phase 2 backend"
      />
      <div className="card card-pad">
        {settings.map((setting) => (
          <div className="setting-row" key={setting.id}>
            <div>
              <div className="setting-name">{setting.name}</div>
              <p className="setting-desc">{setting.description}</p>
            </div>
            <button
              className={`switch${setting.enabled ? " on" : ""}`}
              onClick={() => toggle(setting.id)}
              role="switch"
              aria-checked={setting.enabled}
              aria-label={setting.name}
            />
          </div>
        ))}
      </div>

      <SectionHeader
        title="Appearance"
        subtitle="Choose your preferred color theme"
      />
      <div className="card card-pad">
        <div className="setting-row">
          <div>
            <div className="setting-name">Theme</div>
            <p className="setting-desc">Switch between light and dark mode</p>
          </div>
          <button
            className={`switch${theme === "dark" ? " on" : ""}`}
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>

      <SectionHeader
        title="Profile"
        subtitle="Displayed identity within the LADI Portal"
      />
      <div className="card card-pad">
        <div className="setting-row">
          <div>
            <div className="setting-name">Officer</div>
            <p className="setting-desc">A. Deshmukh · Acquisition Officer</p>
          </div>
          <input
            className="text-input"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            aria-label="Officer name"
          />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Designation</div>
            <p className="setting-desc">Role displayed in the portal header</p>
          </div>
          <input
            className="text-input"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            aria-label="Designation"
          />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Department</div>
            <p className="setting-desc">
              Department of Land Resources · Ministry of Rural Development
            </p>
          </div>
          <input
            className="text-input"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            aria-label="Department"
          />
        </div>
      </div>

      <div>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
        {saveMessage && (
          <span className="save-confirmation" style={{ marginLeft: "12px", color: "var(--green)", fontSize: "13px", fontWeight: 500 }}>
            {saveMessage}
          </span>
        )}
      </div>
    </>
  );
}
