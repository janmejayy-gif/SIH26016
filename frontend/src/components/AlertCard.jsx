import { Clock, MapPin, CheckCheck, RotateCcw } from "lucide-react";
import RiskBadge from "./RiskBadge";

export default function AlertCard({
  alert,
  reviewed,
  onToggleReviewed,
  onOpenProject,
}) {
  const isReviewed = Boolean(reviewed);

  return (
    <article
      className={`card alert-card sev-${alert.severity.toLowerCase()}${
        isReviewed ? " reviewed" : ""
      }`}
    >
      {!isReviewed && (
        <span className="alert-unread" aria-label="Unreviewed alert" />
      )}
      <div className="alert-body">
        <div className="alert-title-row">
          <RiskBadge level={alert.severity} />
          <h3 className="alert-title">{alert.title}</h3>
          <span className="category-chip">{alert.category}</span>
        </div>
        <p className="alert-desc">{alert.description}</p>
        {alert.recommendedAction && (
          <p className="alert-action">
            <b>Recommended:</b> {alert.recommendedAction}
          </p>
        )}
        <div className="alert-meta">
          <span>
            <MapPin size={13} aria-hidden="true" />
            {alert.location}
          </span>
          <span>
            <Clock size={13} aria-hidden="true" />
            {alert.time}
          </span>
          <span>Ref · {alert.id}</span>
          {alert.projectId && onOpenProject && (
            <button
              type="button"
              className="action-link"
              onClick={() => onOpenProject(alert.projectId)}
            >
              Open related project
            </button>
          )}
        </div>
      </div>
      {onToggleReviewed && (
        <button
          type="button"
          className={`btn-mini${isReviewed ? " done" : ""}`}
          onClick={() => onToggleReviewed(alert.id)}
          aria-pressed={isReviewed}
        >
          {isReviewed ? (
            <>
              <RotateCcw size={13} aria-hidden="true" />
              Reopen
            </>
          ) : (
            <>
              <CheckCheck size={13} aria-hidden="true" />
              Mark reviewed
            </>
          )}
        </button>
      )}
    </article>
  );
}
