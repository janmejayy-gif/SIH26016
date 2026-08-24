import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ProjectTable from "../components/ProjectTable.jsx";
import { useOutletContext } from "react-router-dom";
import { allProjects } from "../data/projects.js";
import { uniqueStates, RISK_LEVELS } from "../utils/projectUtils.js";
import { getProjects } from "../services/api.js";
import {
  predictProjectRisk,
  getRiskLevel,
  predictDelayDays,
} from "../utils/riskEngine.js";

const STATE_OPTIONS = ["All States", ...uniqueStates()];
const RISK_OPTIONS = ["All Risks", ...RISK_LEVELS];

// Priority score: weighted combination of risk score, probability, and normalized delay
const SORT_OPTIONS = [
  { value: "prob-desc", label: "Delay Risk · Highest first" },
  { value: "prob-asc", label: "Delay Risk · Lowest first" },
  { value: "priority-desc", label: "Priority · Highest first" },
  { value: "priority-asc", label: "Priority · Lowest first" },
  { value: "risk-desc", label: "Predicted Risk · Highest first" },
  { value: "risk-asc", label: "Predicted Risk · Lowest first" },
  { value: "delay-desc", label: "Expected Delay · Longest first" },
  { value: "delay-asc", label: "Expected Delay · Shortest first" },
];

function computePriority(project) {
  const riskScore = predictProjectRisk(project);
  const delayDays = predictDelayDays(riskScore, project.status || "Monitoring");
  // Normalize delay days (cap at 300 days for normalization)
  const normDelay = Math.min(delayDays, 300) / 300;
  // Weighted: 40% risk, 30% probability, 30% delay
  return Math.round(riskScore * 0.4 + project.probability * 0.3 + normDelay * 100 * 0.3);
}

export default function Projects() {
  const { openProject } = useOutletContext();
  const [searchParams] = useSearchParams();

  const [apiProjects, setApiProjects] = useState(null);
  const [source, setSource] = useState("local");

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [riskFilter, setRiskFilter] = useState("All Risks");
  const [sortBy, setSortBy] = useState("prob-desc");

  useEffect(() => {
    document.title = "Projects · LADI Portal";
  }, []);

  // Pre-filter when arriving via /projects?risk=... links.
  useEffect(() => {
    const risk = searchParams.get("risk");
    const state = searchParams.get("state");
    if (risk && RISK_LEVELS.includes(risk)) setRiskFilter(risk);
    if (state && uniqueStates().includes(state)) setStateFilter(state);
  }, [searchParams]);

  // Try the backend first; fall back to bundled mock data if unavailable.
  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setApiProjects(data);
          setSource("api");
        }
      })
      .catch(() => {
        if (active) setSource("local");
      });
    return () => {
      active = false;
    };
  }, []);

  const dataset = apiProjects && apiProjects.length > 0 ? apiProjects : allProjects;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...dataset]
      .filter((p) => {
        if (stateFilter !== "All States" && p.state !== stateFilter) return false;
        if (riskFilter !== "All Risks" && p.risk !== riskFilter) return false;
        if (
          q &&
          ![p.name, p.id, p.state, p.district || ""]
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
          return false;
        return true;
      });

    // Sort based on sortBy
    list.sort((a, b) => {
      switch (sortBy) {
        case "prob-asc":
          return a.probability - b.probability;
        case "prob-desc":
          return b.probability - a.probability;
        case "priority-asc":
          return computePriority(a) - computePriority(b);
        case "priority-desc":
          return computePriority(b) - computePriority(a);
        case "risk-asc":
          return predictProjectRisk(a) - predictProjectRisk(b);
        case "risk-desc":
          return predictProjectRisk(b) - predictProjectRisk(a);
        case "delay-asc":
          return (
            predictDelayDays(predictProjectRisk(a), a.status || "Monitoring") -
            predictDelayDays(predictProjectRisk(b), b.status || "Monitoring")
          );
        case "delay-desc":
          return (
            predictDelayDays(predictProjectRisk(b), b.status || "Monitoring") -
            predictDelayDays(predictProjectRisk(a), a.status || "Monitoring")
          );
        default:
          return b.probability - a.probability;
      }
    });

    return list;
  }, [dataset, search, stateFilter, riskFilter, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setStateFilter("All States");
    setRiskFilter("All Risks");
    setSortBy("prob-desc");
  };

  // Add priority and predicted risk to each project for display
  const displayProjects = useMemo(() => {
    return filtered.map((p) => ({
      ...p,
      priority: computePriority(p),
      predictedRisk: predictProjectRisk(p),
      expectedDelayDays: predictDelayDays(predictProjectRisk(p), p.status || "Monitoring"),
    }));
  }, [filtered]);

  return (
    <>
      <PageHeader
        title="Project Register"
        subtitle="Interactive register of monitored land acquisition projects. Click any project for full intelligence."
      >
        <span className="module-tag">Phase 2 Module</span>
      </PageHeader>

      <SectionHeader
        title={`Portfolio · ${displayProjects.length} of ${dataset.length} projects`}
        subtitle={
          source === "api"
            ? "Live from LADI Backend"
            : "Local demonstration data (backend unavailable)"
        }
      />

      <div className="filter-row">
        <label className="filter-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="text"
            className="text-input"
            placeholder="Name, ID, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search projects"
          />
        </label>
        <select
          className="select-input"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          aria-label="Filter projects by state"
        >
          {STATE_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="select-input"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          aria-label="Filter projects by risk level"
        >
          {RISK_OPTIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select
          className="select-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort projects"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(search || stateFilter !== "All States" || riskFilter !== "All Risks") && (
          <button className="btn btn-outline" onClick={resetFilters}>
            Reset filters
          </button>
        )}
      </div>

      {displayProjects.length > 0 ? (
        <ProjectTable projects={displayProjects} onRowClick={openProject} showPriority />
      ) : (
        <div className="card placeholder-panel">
          <h3>No matching projects found.</h3>
          <p>Adjust or reset the search and filters to view registered projects.</p>
          <button className="btn btn-primary" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      )}
    </>
  );
}