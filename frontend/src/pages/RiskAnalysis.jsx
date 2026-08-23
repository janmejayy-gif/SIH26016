import { useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function RiskAnalysis() {
  useEffect(() => {
    document.title = "Risk Analysis · LADI Portal";
  }, []);

  return (
    <>
      <PageHeader
        title="Risk Analysis"
        subtitle="Delay-risk drivers and mitigation recommendations."
      >
        <span className="module-tag">Phase 2 Module</span>
      </PageHeader>

      <SectionHeader
        title="Risk Overview"
        subtitle="Share of monitored projects currently flagged by each risk driver"
      />
      <div className="stat-strip">
        <div className="card stat-tile">
          <span className="stat-tile-label">Average Predicted Risk</span>
          <span className="stat-tile-value">64%</span>
          <span className="stat-tile-hint">+6 pts vs last quarter</span>
        </div>
        <div className="card stat-tile">
          <span className="stat-tile-label">Critical Projects</span>
          <span className="stat-tile-value">80</span>
          <span className="stat-tile-hint">Out of 248 projects</span>
        </div>
        <div className="card stat-tile">
          <span className="stat-tile-label">Highest-Risk State</span>
          <span className="stat-tile-value">Uttar Pradesh</span>
          <span className="stat-tile-hint">66% avg risk · 17 high/critical</span>
        </div>
      </div>

      <SectionHeader
        title="Risk Drivers"
        subtitle="Most common factors contributing to delay risk"
      />
      <div className="driver-list">
        <div className="driver-row">
          <span className="driver-name">Landowner objections</span>
          <span className="state-caption">42%</span>
        </div>
        <div className="driver-row">
          <span className="driver-name">Compensation disputes</span>
          <span className="state-caption">31%</span>
        </div>
        <div className="driver-row">
          <span className="driver-name">Litigation</span>
          <span className="state-caption">24%</span>
        </div>
        <div className="driver-row">
          <span className="driver-name">Survey backlog</span>
          <span className="state-caption">18%</span>
        </div>
      </div>

      <SectionHeader
        title="State Risk Scores"
        subtitle="Average predicted delay probability for each monitored state"
      />
      <div className="progress-grid">
        {[
          { state: "Uttar Pradesh", risk: 66 },
          { state: "Maharashtra", risk: 58 },
          { state: "Rajasthan", risk: 52 },
          { state: "Madhya Pradesh", risk: 49 },
          { state: "Bihar", risk: 44 },
        ].map((row) => (
          <div className="progress-bar" key={row.state}>
            <span className="progress-bar-title">{row.state}</span>
            <span className="progress-bar-value">{row.risk}%</span>
          </div>
        ))}
      </div>
    </>
  );
}