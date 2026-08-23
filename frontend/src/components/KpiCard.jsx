export default function KpiCard({ icon: Icon, label, value, support, progress, tone = "blue" }) {
  return (
    <article className={`card kpi-card tone-${tone}`}>
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
        <div className="kpi-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </article>
  );
}
