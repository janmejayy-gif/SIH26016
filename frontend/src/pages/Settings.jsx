import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

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

  useEffect(() => {
    document.title = "Settings · LADI Portal";
  }, []);

  const toggle = (id) =>
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );

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
        title="Profile"
        subtitle="Displayed identity within the LADI Portal"
      />
      <div className="card card-pad">
        <div className="setting-row">
          <div>
            <div className="setting-name">Officer</div>
            <p className="setting-desc">A. Deshmukh · Acquisition Officer</p>
          </div>
          <input className="text-input" defaultValue="A. Deshmukh" aria-label="Officer name" />
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
            defaultValue="DoLR, MoRD"
            aria-label="Department"
          />
        </div>
      </div>

      <div>
        <button className="btn btn-primary">Save Preferences</button>
      </div>
    </>
  );
}
