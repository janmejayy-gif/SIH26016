const LEVEL_CLASS = {
  Low: "risk-low",
  Medium: "risk-medium",
  High: "risk-high",
  Critical: "risk-critical",
};

export default function RiskBadge({ level }) {
  const cls = LEVEL_CLASS[level] || "risk-medium";
  return (
    <span className={`risk-badge ${cls}`}>
      <span className="risk-dot" aria-hidden="true" />
      {level}
    </span>
  );
}
