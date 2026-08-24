import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, MapPin, CalendarClock, Stethoscope } from "lucide-react";
import RiskBadge from "./RiskBadge.jsx";
import { getProjectById, formatTimestamp, riskColor } from "../utils/projectUtils.js";
import {
  predictProject,
  getRiskLevel,
  getRiskDrivers,
  getRecommendedAction,
} from "../utils/riskEngine.js";

export default function ProjectDetailPanel({ projectId, onClose }) {
  const project = getProjectById(projectId);

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

  if (!project) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal-panel card"
          role="dialog"
          aria-modal="true"
          aria-label="Project not found"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="placeholder-panel">
            <h3>Project not found</h3>
            <p>
              No registered project matches reference "{projectId}". It may
              have been archived or the identifier is invalid.
            </p>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const predicted = predictProject(project);
  const drivers = getRiskDrivers(project);
  const primaryFactor = drivers.length > 0 ? drivers[0].key : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="proj-id">{project.id}</span>
            <h2 className="modal-title">{project.name}</h2>
            <div className="modal-subrow">
              <RiskBadge level={project.risk} />
              <span className="category-chip">{project.status}</span>
              <span className="alert-meta-span">
                <MapPin size={13} aria-hidden="true" />
                {project.district}, {project.state}
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
              <span
                className="detail-big"
                style={{ color: riskColor(predicted.predictedDelayRisk) }}
              >
                {predicted.predictedDelayRisk}%
              </span>
            </div>
            <div className="detail-cell">
              <span className="stat-tile-label">Risk Level</span>
              <span className="detail-big" style={{ color: riskColor(predicted.riskLevel) }}>
                {predicted.riskLevel}
              </span>
            </div>
            <div className="detail-cell">
              <span className="stat-tile-label">Expected Delay</span>
              <span className="detail-mid">
                {predicted.expectedDelayDays} days
              </span>
            </div>
            <div className="detail-cell">
              <span className="stat-tile-label">Model Confidence</span>
              <span className="detail-mid">{predicted.confidence}%</span>
            </div>
          </div>

          <h3 className="modal-section-title">Primary Driver</h3>
          {primaryFactor && (
            <div className="detail-cell">
              <span
                className={`risk-badge risk-${primaryFactor === "landownerObjections" ? "high" : "low"}`}
              >
                <span className="risk-dot" aria-hidden="true" />
                {primaryFactor}
              </span>
            </div>
          )}

          <h3 className="modal-section-title">Risk Drivers</h3>
          <ul className="factor-list">
            {drivers.map((d, i) => (
              <li key={i}>
                <span
                  className="risk-dot"
                  style={{ background: riskColor(d.severity) }}
                  aria-hidden="true"
                />
                <span>{d.label}: +{d.contribution}pt</span>
              </li>
            ))}
          </ul>

          <h3 className="modal-section-title">Why is this project at risk?</h3>
          <div className="callout">
            <Stethoscope size={16} aria-hidden="true" />
            <p>
              {drivers.length > 0
                ? drivers[0].explanation
                : "No significant risk factors identified."}
            </p>
          </div>

          <h3 className="modal-section-title">Recommended Action</h3>
          <div className="callout">
            <Stethoscope size={16} aria-hidden="true" />
            <p>{predicted.recommendedAction}</p>
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
      </div>
    </div>
  );
}