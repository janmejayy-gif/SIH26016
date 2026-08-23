export default function ProgressCard({ title, value, caption, tone = "blue" }) {
  return (
    <article className="card progress-card">
      <div className="progress-head">
        <span className="progress-title">{title}</span>
        <span className="progress-value">{value}</span>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={parseInt(value, 10) || 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title} risk level`}
      >
        <div
          className={`progress-bar-fill bar-${tone}`}
          style={{ width: `${Math.min(parseInt(value, 10) || 0, 100)}%` }}
        />
      </div>
      {caption && <span className="progress-caption">{caption}</span>}
    </article>
  );
}
