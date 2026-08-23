import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Map as MapIcon } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import MapPanel from "../components/MapPanel.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { stateSummary } from "../data/dashboardData.js";
import { allProjects } from "../data/projects.js";

export default function MapPage() {
  const { openProject } = useOutletContext();
  const [selectedState, setSelectedState] = useState("Uttar Pradesh");

  useEffect(() => {
    document.title = "Map · LADI Portal";
  }, []);

  const selectedProject = useMemo(() => {
    const inState = allProjects.filter((p) => p.state === selectedState);
    if (inState.length === 0) return null;
    return [...inState].sort((a, b) => b.probability - a.probability)[0];
  }, [selectedState]);

  const summary = stateSummary.find((s) => s.state === selectedState);

  return (
    <>
      <PageHeader
        title="Geographic Risk View"
        subtitle="Select a marker to inspect the most at-risk monitored project in that state."
      >
        <span className="module-tag">Phase 2 Module</span>
      </PageHeader>

      <div className="map-layout">
        <MapPanel selectedState={selectedState} onSelectState={setSelectedState} />

        <aside className="card map-side">
          <h2 className="section-title">{selectedState}</h2>
          {summary && (
            <p className="state-stats">
              <b>{summary.projects}</b> projects ·{" "}
              <b>{summary.highCritical}</b> high/critical · avg risk{" "}
              <b>{summary.riskPercent}%</b>
            </p>
          )}

          {selectedProject ? (
            <>
              <div className="map-side-divider" />
              <span className="stat-tile-label">Highest-risk project in state</span>
              <h3 className="map-side-title">{selectedProject.name}</h3>
              <div className="proj-id">{selectedProject.id}</div>
              <dl className="detail-grid map-detail-grid">
                <div className="detail-cell">
                  <dt className="stat-tile-label">District</dt>
                  <dd className="detail-mid">{selectedProject.district}</dd>
                </div>
                <div className="detail-cell">
                  <dt className="stat-tile-label">Risk</dt>
                  <dd>
                    <RiskBadge level={selectedProject.risk} />
                  </dd>
                </div>
                <div className="detail-cell">
                  <dt className="stat-tile-label">Delay Probability</dt>
                  <dd className="detail-mid prob-value">{selectedProject.probability}%</dd>
                </div>
              </dl>
              <button
                className="btn btn-primary"
                onClick={() => openProject(selectedProject.id)}
              >
                Open Project
              </button>
            </>
          ) : (
            <div className="placeholder-panel" style={{ padding: "24px 12px" }}>
              <h3>No monitored projects</h3>
              <p>No registered projects exist for this state yet.</p>
            </div>
          )}
        </aside>
      </div>

      <SectionHeader
        title="State Project Counts"
        subtitle="Monitored portfolio by state"
      />
      <div className="map-grid">
        {stateSummary.map((row) => (
          <button
            type="button"
            key={row.state}
            className={`card map-tile map-tile-btn${row.state === selectedState ? " active" : ""}`}
            onClick={() => setSelectedState(row.state)}
          >
            <span className="map-tile-name">
              {row.state}
              <span className={`risk-badge risk-${row.tone}`}>
                {row.riskPercent}%
              </span>
            </span>
            <span className="map-tile-count">
              {row.projects} projects · {row.highCritical} high/critical
            </span>
          </button>
        ))}
      </div>

      <div className="card placeholder-panel">
        <span className="placeholder-icon" aria-hidden="true">
          <MapIcon size={24} />
        </span>
        <h3>Interactive GIS layer planned for Phase 3</h3>
        <p>
          District-level choropleth mapping with parcel boundaries will be
          integrated once the geospatial pipeline is available. The current
          panel uses a stylised vector representation with mock aggregates.
        </p>
      </div>
    </>
  );
}
