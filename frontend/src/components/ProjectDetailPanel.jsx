import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, MapPin, Stethoscope, AlertTriangle, Eye, CheckCircle } from "lucide-react";
import RiskBadge from "./RiskBadge.jsx";
import { getProjectById, formatTimestamp } from "../utils/projectUtils.js";
import {
  predictProject,
  getRiskLevel,
  getRiskDrivers,
  getRecommendedAction,
  RISK_FACTOR_LABELS,
} from "../utils/riskEngine.js";

export default function ProjectDetailPanel({ projectId, onClose }) {
  const project = getProjectById(projectId);

  // All hooks MUST run unconditionally before any early return
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

  const predicted = useMemo(() => (project ? predictProject(project) : null), [project]);
  const drivers = useMemo(() => (project ? getRiskDrivers(project) : []), [project]);
  const primaryFactor = useMemo(() => (drivers.length > 0 ? drivers[0].key : null), [drivers]);

  // Determine action priority based on risk level
  const actionPriority = useMemo(() => {
    if (!predicted) return { label: "ON TRACK", level: "low", icon: CheckCircle };
    switch (predicted.riskLevel) {
      case "Critical": return { label: "IMMEDIATE ACTION REQUIRED", level: "critical", icon: AlertTriangle };
      case "High": return { label: "HIGH PRIORITY", level: "high", icon: AlertTriangle };
      case "Medium": return { label: "MONITOR", level: "medium", icon: Eye };
      case "Low": return { label: "ON TRACK", level: "low", icon: CheckCircle };
      default: return { label: "ON TRACK", level: "low", icon: CheckCircle };
    }
  }, [predicted]);

  // Get factor progress data for visual progress bars
  const factorProgress = useMemo(() => {
    if (!predicted || !predicted.predictedDelayRisk || predicted.predictedDelayRisk === 0) {
      return drivers.map((d) => ({
        ...d,
        progressPercent: 0,
        severityLevel: d.severity.toLowerCase(),
      }));
    }
    return drivers.map((d) => ({
      ...d,
      progressPercent: Math.min(100, Math.round((d.contribution / predicted.predictedDelayRisk) * 100)) || 0,
      severityLevel: d.severity.toLowerCase(),
    }));
  }, [drivers, predicted]);

  // Early returns AFTER all hooks
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

  // Format risk level for CSS class
  const riskLevelClass = predicted.riskLevel.toLowerCase();

  // Extract icon component for proper JSX rendering
  const ActionIcon = actionPriority.icon;

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
          {/* Risk Summary */}
          <h3 className="modal-section-title">Risk Summary</h3>
          <div className="risk-summary">
            <div className="risk-summary-item">
              <span className="risk-summary-label">Predicted Delay Risk</span>
              <span className={`risk-summary-value ${riskLevelClass}`}>
                {predicted.predictedDelayRisk}%
              </span>
            </div>
            <div className="risk-summary-item">
              <span className="risk-summary-label">Risk Level</span>
              <span className={`risk-summary-value ${riskLevelClass}`}>
                {predicted.riskLevel}
              </span>
            </div>
            <div className="risk-summary-item">
              <span className="risk-summary-label">Expected Delay</span>
              <span className="risk-summary-value">
                {predicted.expectedDelayDays} days
              </span>
            </div>
            <div className="risk-summary-item">
              <span className="risk-summary-label">Model Confidence</span>
              <span className="risk-summary-value">
                {predicted.confidence}%
              </span>
            </div>
          </div>

          {/* Action Priority */}
          <h3 className="modal-section-title">Action Priority</h3>
          <div className={`action-priority ${actionPriority.level}`}>
            <ActionIcon size={14} aria-hidden="true" />
            {actionPriority.label}
          </div>

          {/* Why Is This Project At Risk? */}
          <h3 className="modal-section-title">Why Is This Project At Risk?</h3>
          <div className="factor-analysis">
            <div className="factor-analysis-title">Risk Factor Breakdown</div>
            {factorProgress.length > 0 ? (
              factorProgress.map((factor, index) => (
                <div className="factor-row" key={index}>
                  <div className="factor-row-header">
                    <span className="factor-name">{factor.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="factor-value">{factor.level}%</span>
                      <span className={`factor-severity ${factor.severityLevel}`}>
                        {factor.severity}
                      </span>
                    </div>
                  </div>
                  <div className="factor-progress">
                    <div
                      className={`factor-progress-fill ${factor.severityLevel}`}
                      style={{ width: `${factor.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="factor-row">
                <span style={{ color: "var(--muted)" }}>No significant risk factors identified.</span>
              </div>
            )}
          </div>

          {/* Primary Risk Driver */}
          <h3 className="modal-section-title">Primary Risk Driver</h3>
          {primaryFactor ? (
            <div className="primary-driver-card">
              <div className="primary-driver-header">
                <div>
                  <span className="primary-driver-name">
                    {RISK_FACTOR_LABELS[primaryFactor] || primaryFactor}
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <span className="primary-driver-value">
                      {project[primaryFactor] || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="primary-driver-explanation">
                {(() => {
                  const primaryDriver = drivers[0];
                  if (!primaryDriver) return "No explanation available.";
                  return `${primaryDriver.label} (${primaryDriver.level}%) contributes ${primaryDriver.contribution} points to the overall risk score of ${predicted.predictedDelayRisk}%, making it the primary driver.`;
                })()}
              </div>
            </div>
) : (
              <div className="primary-driver-card">
                <p style={{ color: "var(--muted)" }}>No significant risk driver identified.</p>
              </div>
            )}

          {/* Recommended Action */}
          <h3 className="modal-section-title">Recommended Action</h3>
          <div className="recommended-action-card">
            <div className="recommended-action-header">
              <Stethoscope className="recommended-action-icon" size={16} aria-hidden="true" />
              <span className="recommended-action-title">Recommended Action</span>
            </div>
            <p className="recommended-action-text">
              {predicted.recommendedAction || "No recommendation available."}
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
      </div>
    </div>
  );
}