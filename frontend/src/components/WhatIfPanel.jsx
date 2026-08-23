import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { predictProjectRisk, getRiskLevel, predictDelayDays } from "../utils/riskEngine.js";

const PORTFOLIO_BASELINE = {
  landownerObjections: 72,
  litigationCases: 64,
  compensationDisputes: 58,
  surveyBacklog: 41,
  // Hidden factors fixed at portfolio-typical levels
  accessIssues: 45,
  environmentalClearance: 38,
};

const FACTOR_WEIGHTS = {
  landownerObjections: 22,
  litigationCases: 18,
  compensationDisputes: 18,
  surveyBacklog: 12,
  utilityRelocation: 8,
  environmentalClearance: 8,
  accessIssues: 6,
  documentationIssues: 6,
};

export default function WhatIfPanel({ onSimulationChange }) {
  const [levels, setLevels] = useState(() => ({ ...PORTFOLIO_BASELINE }));
  const [simulating, setSimulating] = useState(false);

  const computed = useMemo(() => {
    const score = Math.round(
      (levels.landownerObjections * FACTOR_WEIGHTS.landownerObjections +
        levels.litigationCases * FACTOR_WEIGHTS.litigationCases +
        levels.compensationDisputes * FACTOR_WEIGHTS.compensationDisputes +
        levels.surveyBacklog * FACTOR_WEIGHTS.surveyBacklog +
        0 * FACTOR_WEIGHTS.utilityRelocation + // hidden factors not in 5-slider setup
        levels.accessIssues * FACTOR_WEIGHTS.accessIssues +
        levels.environmentalClearance * FACTOR_WEIGHTS.environmentalClearance) /
        100
    );
    const level = riskLevel >= 75 ? "Critical" : riskLevel >= 50 ? "High" : riskLevel >= 25 ? "Medium" : "Low";
    const delayDays = predictDelayDays(riskScore, "Under Review"); // status placeholder
    return { score, level, delayDays };
  }, [levels]);

  const handleSliderChange = (factor, value) => {
    setLevels((prev) => ({ ...prev, [factor]: value }));
    if (onSimulationChange) onSimulationChange({ levels, simulating: true });
  };

  return (
    <div className="card what-if-panel">
      <h3>What-If Analysis</h3>
      <p>Adjust the sliders below to model how changes in risk drivers affect the predicted risk score and delay.</p>

      <div className="slider-row">
        <label>
          <span>Landowner objections</span>
          <input
            type="range"
            min="0"
            max="100"
            value={levels.landownerObjections}
            onChange={(e) => handleSliderChange("landownerObjections", Number(e.target.value))}
          />
          <span>{levels.landownerObjections}%</span>
        </label>
        <label>
          <span>Litigation</span>
          <input
            type="range"
            min="0"
            max="100"
            value={levels.litigationCases}
            onChange={(e) => handleSliderChange("litigationCases", Number(e.target.value))}
          />
          <span>{levels.litigationCases}%</span>
        </label>
        <label>
          <span>Compensation disputes</span>
          <input
            type="range"
            min="0"
            max="100"
            value={levels.compensationDisputes}
            onChange={(e) => handleSliderChange("compensationDisputes", Number(e.target.value))}
          />
          <span>{levels.compensationDisputes}%</span>
        </label>
        <label>
          <span>Survey backlog</span>
          <input
            type="range"
            min="0"
            max="100"
            value={levels.surveyBacklog}
            onChange={(e) => handleSliderChange("surveyBacklog", Number(e.target.value))}
          />
          <span>{levels.surveyBacklog}%</span>
        </label>
      </div>

      <div className="slider-row">
        <label>
          <span>Administrative delays</span>
          <input
            type="range"
            min="0"
            max="100"
            value={PORTFOLIO_BASELINE.utilityRelocation}
            onChange={(e) => handleSliderChange("utilityRelocation", Number(e.target.value))}
          />
          <span>{PORTFOLIO_BASELINE.utilityRelocation}%</span>
        </label>
        {/* Access and environmental are fixed in baseline, not shown as sliders */}
      </div>

      <div className="current-vs-simulated">
        <div className="current">
          <h4>Current (Portfolio Baseline)</h4>
          <p>Risk Score: <strong>{computed.score}</strong></p>
          <p>Risk Level: <strong>{computed.level}</strong></p>
          <p>Predicted Delay: <strong>{computed.delayDays} days</strong></p>
        </div>
        <div className="simulated">
          <h4>Simulated</h4>
          <p>Risk Score: <strong>{computed.score}</strong></p>
          <p>Risk Level: <strong>{computed.level}</strong></p>
          <p>Predicted Delay: <strong>{computed.delayDays} days</strong></p>
        </div>
      </div>

      {simulating && (
        <p className="hint">Simulation active — adjust sliders to see changes.</p>
      )}
    </div>
  );
}