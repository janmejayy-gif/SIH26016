import { stateSummary } from "../data/dashboardData.js";
import { riskColor } from "../utils/projectUtils.js";

const MARKERS = [
  { state: "Uttar Pradesh", x: 232, y: 142, label: "UP" },
  { state: "Maharashtra", x: 138, y: 268, label: "MH" },
  { state: "Rajasthan", x: 128, y: 116, label: "RJ" },
  { state: "Madhya Pradesh", x: 178, y: 198, label: "MP" },
  { state: "Bihar", x: 262, y: 158, label: "BR" },
];

const INDIA_PATH =
  "M196,18 L206,34 L198,52 L212,64 L204,84 L226,92 L246,110 L258,104 L282,112 L306,108 L332,118 L362,112 L376,124 L392,142 L380,158 L356,152 L340,166 L318,162 L304,176 L310,192 L296,208 L302,232 L288,258 L270,286 L252,316 L238,348 L228,382 L216,414 L204,442 L192,452 L182,430 L172,398 L158,368 L146,336 L128,308 L116,282 L98,262 L82,244 L66,238 L52,222 L58,206 L74,210 L88,198 L78,180 L64,168 L58,148 L70,132 L86,122 L96,106 L112,92 L126,76 L138,60 L150,44 L164,30 Z";

export default function MapPanel({ selectedState, onSelectState }) {
  return (
    <div className="map-canvas card">
      <svg
        viewBox="0 0 420 470"
        className="map-svg"
        role="img"
        aria-label="Stylised map of monitored states"
      >
        <path d={INDIA_PATH} fill="#eaf1fe" stroke="#c7dbfc" strokeWidth="1.5" />
        {[70, 140, 210, 280, 350, 420].map((y) => (
          <line key={y} x1="20" x2="400" y1={y} y2={y} stroke="#dbe7f5" strokeWidth="0.5" strokeDasharray="2 4" />
        ))}
        {[60, 130, 200, 270, 340].map((x) => (
          <line key={x} y1="10" y2="460" x1={x} x2={x} stroke="#dbe7f5" strokeWidth="0.5" strokeDasharray="2 4" />
        ))}
        {MARKERS.map((marker) => {
          const summary = stateSummary.find((s) => s.state === marker.state);
          const selected = selectedState === marker.state;
          return (
            <g
              key={marker.state}
              className={`map-marker${selected ? " selected" : ""}`}
              onClick={() => onSelectState(marker.state)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectState(marker.state);
              }}
              aria-label={`${marker.state}: ${summary ? summary.projects : 0} projects`}
            >
              {selected && (
                <circle cx={marker.x} cy={marker.y} r="15" fill={riskColor(summary.tone === "green" ? "Low" : summary.tone === "amber" ? "Medium" : summary.tone === "orange" ? "High" : "Critical")} opacity="0.18" />
              )}
              <circle
                cx={marker.x}
                cy={marker.y}
                r="9"
                fill={riskColor(summary?.tone === "green" ? "Low" : summary?.tone === "amber" ? "Medium" : summary?.tone === "orange" ? "High" : "Critical")}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={marker.x + 13}
                y={marker.y - 8}
                fontSize="11"
                fontWeight="700"
                fill="#10294b"
              >
                {marker.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="map-legend">
        {["Low", "Medium", "High", "Critical"].map((level) => (
          <span className="legend-item" key={level}>
            <span
              className="legend-swatch"
              style={{ background: riskColor(level), borderRadius: "50%" }}
              aria-hidden="true"
            />
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}
