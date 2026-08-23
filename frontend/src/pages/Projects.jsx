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

const STATE_OPTIONS = ["All States", ...uniqueStates()];
const RISK_OPTIONS = ["All Risks", ...RISK_LEVELS];

export default function Projects() {
  const { openProject } = useOutletContext();
  const [searchParams] = useSearchParams();

  const [apiProjects, setApiProjects] = useState(null);
  const [source, setSource] = useState("local");

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [riskFilter, setRiskFilter] = useState("All Risks");
  const [sortDir, setSortDir] = useState("desc");

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
    return [...dataset]
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
      })
      .sort((a, b) =>
        sortDir === "asc"
          ? a.probability - b.probability
          : b.probability - a.probability
      );
  }, [dataset, search, stateFilter, riskFilter, sortDir]);

  const resetFilters = () => {
    setSearch("");
    setStateFilter("All States");
    setRiskFilter("All Risks");
    setSortDir("desc");
  };

  return (
    <>
      <PageHeader
        title="Project Register"
        subtitle="Interactive register of monitored land acquisition projects. Click any project for full intelligence."
      >
        <span className="module-tag">Phase 2 Module</span>
      </PageHeader>

      <SectionHeader
        title={`Portfolio · ${filtered.length} of ${dataset.length} projects`}
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
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
          aria-label="Sort projects by delay risk"
        >
          <option value="desc">Delay Risk · Highest first</option>
          <option value="asc">Delay Risk · Lowest first</option>
        </select>
        {(search || stateFilter !== "All States" || riskFilter !== "All Risks") && (
          <button className="btn btn-outline" onClick={resetFilters}>
            Reset filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <ProjectTable projects={filtered} onRowClick={openProject} />
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
