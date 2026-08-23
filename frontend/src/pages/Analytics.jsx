import { useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ChartCard from "../components/ChartCard.jsx";
import {
  riskDistribution,
  riskDistributionTotal,
  delayTrend,
} from "../data/dashboardData.js";
import {
  avgDelayByCategory,
  stateDelayRisk,
  delayDrivers,
} from "../data/analytics.js";

const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #d4deeb",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(16,41,75,0.08)",
  fontSize: 12.5,
};

const CATEGORY_COLORS = ["#16a34a", "#d97706", "#ea580c", "#dc2626"];

export default function Analytics() {
  useEffect(() => {
    document.title = "Analytics · LADI Portal";
  }, []);

  const trendTooltip = useMemo(
    () => ({
      formatter: (value) => [`${value}%`, "Delay Risk"],
      labelStyle: { color: "#10294b", fontWeight: 600 },
      contentStyle: TOOLTIP_STYLE,
    }),
    []
  );

  return (
    <>
      <PageHeader
        title="Portfolio Analytics"
        subtitle="Comparative views across states, categories and delay drivers."
      >
        <span className="module-tag">Phase 2 Module</span>
      </PageHeader>

      <div className="stat-strip">
        <article className="card stat-tile">
          <span className="stat-tile-label">6-Month Risk Movement</span>
          <span className="stat-tile-value">+16 pts</span>
          <span className="stat-tile-hint">48% → 64% since March</span>
        </article>
        <article className="card stat-tile">
          <span className="stat-tile-label">Peak Month</span>
          <span className="stat-tile-value">Aug · 64%</span>
          <span className="stat-tile-hint">Monsoon-season acquisition slowdown</span>
        </article>
        <article className="card stat-tile">
          <span className="stat-tile-label">Highest-Risk State</span>
          <span className="stat-tile-value">UP · 66%</span>
          <span className="stat-tile-hint">17 high/critical projects</span>
        </article>
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Delay Risk by State"
          subtitle="Average predicted delay probability (%)"
        >
          <div className="trend-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateDelayRisk} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis
                  dataKey="short"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#5c7089", fontSize: 12 }}
                  dy={6}
                />
                <YAxis
                  domain={[0, 80]}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8aa0b8", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, _name, payload) => [
                    `${value}%`,
                    payload?.payload?.state || "State",
                  ]}
                  cursor={{ fill: "#f4f8fd" }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="risk" radius={[6, 6, 0, 0]} barSize={38}>
                  {stateDelayRisk.map((row) => (
                    <Cell key={row.short} fill={row.tone} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Average Delay by Risk Category"
          subtitle="Expected schedule slippage (months) per category"
        >
          <div className="trend-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={avgDelayByCategory}
                layout="vertical"
                margin={{ top: 8, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${v} mo`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8aa0b8", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={70}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#33475e", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value} months`, "Avg delay"]}
                  cursor={{ fill: "#f4f8fd" }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="months" radius={[0, 6, 6, 0]} barSize={20}>
                  {avgDelayByCategory.map((row) => (
                    <Cell
                      key={row.category}
                      fill={
                        CATEGORY_COLORS[
                          ["Low", "Medium", "High", "Critical"].indexOf(row.category)
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Risk Trend Over Time"
        subtitle="Average predicted delay risk across monitored projects (Mar – Aug)"
      >
        <div className="trend-body">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={delayTrend} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5c7089", fontSize: 12 }}
                dy={6}
              />
              <YAxis
                domain={[45, 70]}
                ticks={[45, 50, 55, 60, 65, 70]}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8aa0b8", fontSize: 12 }}
              />
              <Tooltip {...trendTooltip} cursor={{ stroke: "#c7dbfc" }} />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                fill="url(#analyticsTrendFill)"
                dot={{ r: 3, fill: "#1d4ed8", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#1a3fae", strokeWidth: 2, stroke: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="charts-grid">
        <ChartCard
          title="Top Delay Drivers"
          subtitle="Weighted contribution to overall delay risk (%)"
        >
          <div className="trend-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={delayDrivers}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 80]}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8aa0b8", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="factor"
                  width={150}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#33475e", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Contribution"]}
                  cursor={{ fill: "#f4f8fd" }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="share" radius={[0, 6, 6, 0]} barSize={16} fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Project Distribution"
          subtitle={`${riskDistributionTotal} projects by predicted risk level`}
        >
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={66}
                  outerRadius={92}
                  paddingAngle={2}
                  cornerRadius={4}
                  strokeWidth={0}
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} projects`, name]}
                  contentStyle={TOOLTIP_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center" aria-hidden="true">
              <span className="donut-center-value">{riskDistributionTotal}</span>
              <span className="donut-center-label">Total Projects</span>
            </div>
          </div>
          <div className="legend-row">
            {riskDistribution.map((entry) => (
              <span className="legend-item" key={entry.name}>
                <span
                  className="legend-swatch"
                  style={{ background: entry.color }}
                  aria-hidden="true"
                />
                {entry.name}
                <span className="legend-value">{entry.value}</span>
              </span>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}
