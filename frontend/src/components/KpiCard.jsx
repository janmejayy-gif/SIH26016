import { Link } from "react-router-dom";

export default function KpiCard({
  icon: Icon,
  label,
  value,
  support,
  progress,
  tone = "blue",
  to,
}) {
  const body = (
    <>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {Icon && (
          <span className="kpi-icon" aria-hidden="true">
            <Icon size={17} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-support">{support}</div>
      <div
        className="kpi-bar"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} indicator`}
      >
        <div
          className="kpi-bar-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`card kpi-card kpi-link tone-${tone}`}>
        {body}
      </Link>
    );
  }

  return (
    <article className={`card kpi-card tone-${tone}`}>{body}</article>
  );
}
