// ---------------------------------------------------------------------------
// LADI Portal — Project data helpers (Phase 2)
// Pure functions over the mock dataset; no UI imports allowed here.
// ---------------------------------------------------------------------------

import { allProjects } from "../data/projects.js";

export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

export function riskTone(level) {
  switch (level) {
    case "Low":
      return "green";
    case "Medium":
      return "amber";
    case "High":
      return "orange";
    case "Critical":
      return "red";
    default:
      return "blue";
  }
}

export function riskColor(level) {
  switch (level) {
    case "Low":
      return "#16a34a";
    case "Medium":
      return "#d97706";
    case "High":
      return "#ea580c";
    case "Critical":
      return "#dc2626";
    default:
      return "#64748b";
  }
}

export function getProjectById(id) {
  if (!id) return null;
  return allProjects.find((project) => project.id === id) || null;
}

export function uniqueStates() {
  return [...new Set(allProjects.map((p) => p.state))].sort();
}

export function searchProjects(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  return allProjects.filter((p) =>
    [p.name, p.id, p.state, p.district]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export function filterProjects({
  search = "",
  state = "All States",
  risk = "All Risks",
  sortDir = "desc",
} = {}) {
  const q = search.trim().toLowerCase();
  let list = allProjects.filter((p) => {
    if (state !== "All States" && p.state !== state) return false;
    if (risk !== "All Risks" && p.risk !== risk) return false;
    if (
      q &&
      ![p.name, p.id, p.state, p.district]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });
  list = [...list].sort((a, b) =>
    sortDir === "asc"
      ? a.probability - b.probability
      : b.probability - a.probability
  );
  return list;
}

export function formatTimestamp(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}
