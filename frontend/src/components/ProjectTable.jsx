import { ArrowUpRight } from "lucide-react";
import RiskBadge from "./RiskBadge";

const PROB_COLOR = {
  Low: "#16a34a",
  Medium: "#d97706",
  High: "#ea580c",
  Critical: "#dc2626",
};

export default function ProjectTable({ projects, onRowClick }) {
  const open = (event, id) => {
    if (!onRowClick) return;
    event.stopPropagation();
    onRowClick(id);
  };

  return (
    <div className="card table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>State</th>
            <th>Risk</th>
            <th>Delay Risk</th>
            <th>Primary Factor</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className={onRowClick ? "row-clickable" : undefined}
              onClick={onRowClick ? () => onRowClick(project.id) : undefined}
            >
              <td className="proj-name" title={project.name}>
                {project.name}
                <div className="proj-id">{project.id}</div>
              </td>
              <td>{project.state}</td>
              <td>
                <RiskBadge level={project.risk} />
              </td>
              <td className="prob-cell">
                <span className="prob-value">{project.probability}%</span>
                <div className="prob-bar">
                  <div
                    className="prob-bar-fill"
                    style={{
                      width: `${project.probability}%`,
                      background: PROB_COLOR[project.risk] || "#64748b",
                    }}
                  />
                </div>
              </td>
              <td>{project.primaryFactor}</td>
              <td>
                <button
                  type="button"
                  className="action-link"
                  onClick={(e) => open(e, project.id)}
                >
                  View
                  <ArrowUpRight size={13} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
