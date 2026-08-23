import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TONE_CLASS = {
  red: "tone-red",
  amber: "tone-amber",
  orange: "tone-orange",
  green: "tone-green",
  blue: "tone-blue",
  navy: "tone-navy",
};

export default function QuickAction({ to, icon: Icon, title, description, tone = "blue" }) {
  return (
    <Link to={to} className={`card quick-action ${TONE_CLASS[tone] || TONE_CLASS.blue}`}>
      <span className="kpi-icon qa-icon" aria-hidden="true">
        {Icon && <Icon size={18} strokeWidth={2} />}
      </span>
      <span className="qa-body">
        <span className="qa-title">{title}</span>
        <p className="qa-desc">{description}</p>
      </span>
      <ArrowRight size={16} className="qa-arrow" aria-hidden="true" />
    </Link>
  );
}
