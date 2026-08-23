import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, MapPin, CalendarClock, Stethoscope } from "lucide-react";
import RiskBadge from "./RiskBadge.jsx";

export default function ProjectDetailPanel({ projectId, onClose }) {
  useEffect(() => {
    if (!projectId) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [projectId, onClose]);

  if (!projectId) return null;

  // Safely parse project ID parts; avoid .split() on null/undefined
  let projectIdNum = 0;
  let stateCode = "Unknown";
  if (projectId && projectId.split) {
    const parts = projectId.split("-");
    if (parts.length >= 3) {
      projectIdNum = parseInt(parts[2], 10) || 0;
      stateCode = parts[1] || "Unknown";
    }
  }

  const project = {
    id: projectId,
    name: projectId ? "Project " + (stateCode || "Unknown") : "Project",
    state: stateCode || "Uttar Pradesh",
    risk: "Medium",
    probability: 64,
    expectedDelay: "~6 months",
    status: "Monitoring",
    primaryFactor: "Unknown",
    landownerObjections: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
    litigationCases: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
    compensationDisputes: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
    surveyBacklog: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
    utilityRelocation: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
    environmentalClearance: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
    accessIssues: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
    documentationIssues: projectId ? parseInt(projectId.split("-")[1]) % 100 : 0,
  };

  useEffect(() => {
    if (!projectId) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [projectId, onClose]);

  if (!projectId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-label={project ? project.name : "Project not found"}
        onClick={(e) => e.stopPropagation()}
      >
        {!project ? (
          <div className="placeholder-panel">
            <h3>Project not found</h3>
            <p>
              No registered project matches the identifier.
            </p>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <div>
                <span className="proj-id">{project.id}</span>
                <h2 className="modal-title">{project.name}</h2>
                <div className="modal-subrow">
                  <RiskBadge level={project.risk} />
                  <span className="category-chip">{project.status}</span>
                  <span className="alert-meta-span">
                    <MapPin size={13} aria-hidden="true" />
                    {project.state}
                  </span>
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={onClose}
                aria-label="Close project details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-cell">
                  <span className="stat-tile-label">Predicted Delay Risk</span>
                  <span className="detail-big">64%</span>
                </div>
                <div className="detail-cell">
                  <span className="stat-tile-label">Expected Delay</span>
                  <span className="detail-mid">~6 months</span>
                </div>
                <div className="detail-cell">
                  <span className="stat-tile-label">Primary Factor</span>
                  <span className="detail-mid">Unknown</span>
                </div>
                <div className="detail-cell">
                  <span className="stat-tile-label">Last Updated</span>
                  <span className="detail-mid detail-with-icon">
                    <CalendarClock size={14} aria-hidden="true" />
                    ~21 Aug 2026, 14:30
                  </span>
                </div>
              </div>

              <h3 className="modal-section-title">Key Risk Factors</h3>
              <ul className="factor-list">
                <li>
                  <span className="risk-dot" style={{ background: "#dc2626" }} aria-hidden="true" />
                  Landowner objections
                </li>
                <li>
                  <span className="risk-dot" style={{ background: "#d97706" }} aria-hidden="true" />
                  Compensation disputes
                </li>
                <li>
                  <span className="risk-dot" style={{ background: "#16a34a" }} aria-hidden="true" />
                  Survey backlog
                </li>
              </ul>

              <h3 className="modal-section-title">Why is this project at risk?</h3>
              <div className="callout">
                <Stethoscope size={16} aria-hidden="true" />
                <p>
                  Multiple unresolved objections are increasing the probability
                  of acquisition-related delay.
                </p>
              </div>

              <h3 className="modal-section-title">Recommended Action</h3>
              <div className="callout">
                <Stethoscope size={16} aria-hidden="true" />
                <p>
                  Schedule stakeholder consultation and prioritize compensation
                  resolution.
                </p>
              </div>
            </div>

            <div className="modal-foot">
              <Link to="/projects" className="btn btn-outline" onClick={onClose}>
                Open Project Register
              </Link>
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}