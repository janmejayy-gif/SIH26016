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
import { stateSummary, riskDistribution, riskDistributionTotal, delayTrend } from "../data/dashboardData.js";
import { avgDelayByCategory, stateDelayRisk, delayDrivers } from "../data/analytics.js";
import { allProjects } from "../data/projects.js";
import {
  predictProjectRisk,
  getRiskLevel,
  predictDelayDays,
  getRiskDrivers,
  predictPortfolioSummary,
} from "../utils/riskEngine.js";

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

  // Compute portfolio-level predictive metrics
  const portfolioSummary = useMemo(() => predictPortfolioSummary(allProjects), []);
  const predictiveDrivers = useMemo(() => {
    const driverCounts = {};
    allProjects.forEach((p) => {
      const drivers = getRiskDrivers(p);
      drivers.forEach((d) => {
        driverCounts[d.key] = (driverCounts[d.key] || 0) + 1;
      });
    });
    return Object.entries(driverCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({ factor: key, count }));
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
          <span className="stat-tile-label">Average Predicted Risk</span>
          <span className="stat-tile-value">{portfolioSummary.averagePredictedRisk}%</span>
          <span className="stat-tile-hint">{portfolioSummary.totalProjects} projects analyzed</span>
        </article>
        <article className="card stat-tile">
          <span className="stat-tile-label">Average Expected Delay</span>
          <span className="stat-tile-value">{portfolioSummary.averageExpectedDelayDays} days</span>
          <span className="stat-tile-hint">Across all monitored projects</span>
        </article>
        <article className="card stat-tile">
          <span className="stat-tile-label">Critical Predicted</span>
          <span className="stat-tile-value">{portfolioSummary.criticalProjects}</span>
          <span className="stat-tile-hint">{portfolioSummary.highProjects} High risk</span>
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
          title="Top Predictive Drivers"
          subtitle="Most frequent top risk drivers across projects"
        >
          <div className="trend-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={predictiveDrivers}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                <XAxis
                  type="number"
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
                  formatter={(value) => [`${value} projects`, "Frequency"]}
                  cursor={{ fill: "#f4f8fd" }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18} fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Predicted vs Current Risk"
          subtitle="Portfolio-level comparison: recorded vs predicted risk"
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
                <Bar dataKey="risk" radius={[6, 6, 0, 0]} barSize={18} fill="#1d4ed8" >
                  {stateDelayRisk.map((row) => (
                    <Cell key={row.short} fill="#1d4ed8" />
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
          title="Top Predictive Drivers"
          subtitle="Most frequent top risk drivers across projects"
        >
          <div className="trend-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={predictiveDrivers}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                <XAxis
                  type="number"
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
                  formatter={(value) => [`${value} projects`, "Frequency"]}
                  cursor={{ fill: "#f4f8fd" }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18} fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Predicted vs Current Risk"
          subtitle="Portfolio-level comparison: recorded vs predicted risk"
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
                <Bar dataKey="risk" radius={[6, 6, 0, 0]} barSize={18} fill="#1d4ed8" >
                  {stateDelayRisk.map((row) => (
                    <Cell key={row.short} fill="#1d4ed8" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </>
  );
}