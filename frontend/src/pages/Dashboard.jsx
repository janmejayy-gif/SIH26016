import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Eye,
  Gauge,
  Layers,
  MapPin,
  ShieldCheck,
  Siren,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import KpiCard from "../components/KpiCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ProjectTable from "../components/ProjectTable.jsx";
import QuickAction from "../components/QuickAction.jsx";
import {
  kpiCards,
  riskDistribution,
  riskDistributionTotal,
  delayTrend,
  stateSummary,
  quickActions,
} from "../data/dashboardData.js";
import { highRiskProjects } from "../data/projects.js";

const KPI_ICONS = {
  layers: Layers,
  shieldCheck: ShieldCheck,
  eye: Eye,
  alertTriangle: AlertTriangle,
  siren: Siren,
  trendingUp: TrendingUp,
};

const ACTION_ICONS = {
  siren: Siren,
  bell: Bell,
  gauge: Gauge,
  mapPin: MapPin,
};

const KPI_ROUTES = {
  total: "/projects",
  low: "/projects?risk=Low",
  medium: "/projects?risk=Medium",
  high: "/projects?risk=High",
  critical: "/projects?risk=Critical",
  average: "/analytics",
};

function formatStamp(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `UPDATED ${day} ${month} AT ${time}`;
}

export default function Dashboard() {
  const { apiOnline, refreshHealth, openProject } = useOutletContext();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const handleRefresh = useCallback(async () => {
    setLastUpdated(new Date());
    await refreshHealth();
  }, [refreshHealth]);

  useEffect(() => {
    document.title = "Dashboard · LADI Portal";
  }, []);

  const trendTooltip = useMemo(
    () => ({
      contentStyle: {
        background: "#ffffff",
        border: "1px solid #d4deeb",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(16,41,75,0.08)",
        fontSize: 12.5,
      },
      formatter: (value) => [`${value}%`, "Delay Risk"],
      labelStyle: { color: "#10294b", fontWeight: 600 },
    }),
    []
  );

  return (
    <>
      <PageHeader
        title="Land Acquisition Intelligence"
        subtitle="Predictive monitoring and early warning system for infrastructure projects."
      >
        <span className={`status-pill${apiOnline ? "" : " offline"}`}>
          <span className="status-dot" aria-hidden="true" />
          {apiOnline ? "System Operational" : "Offline Mode"}
        </span>
        <span className="last-updated">{formatStamp(lastUpdated)}</span>
        <button className="btn btn-outline" onClick={handleRefresh}>
          <RefreshCw size={14} aria-hidden="true" />
          Refresh
        </button>
      </PageHeader>

      {/* KPI cards */}
      <div className="kpi-grid">
        {kpiCards.map((kpi) => (
          <KpiCard
            key={kpi.id}
            icon={KPI_ICONS[kpi.icon]}
            label={kpi.label}
            value={kpi.value}
            support={kpi.support}
            progress={kpi.progress}
            tone={kpi.tone}
            to={KPI_ROUTES[kpi.id]}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <ChartCard
          title="Risk Distribution"
          subtitle="Portfolio breakdown by predicted delay risk level"
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
                  onClick={(entry) => {
                    if (entry && entry.name)
                      navigate(`/projects?risk=${encodeURIComponent(entry.name)}`);
                  }}
                  cursor="pointer"
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} projects`, name]}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #d4deeb",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(16,41,75,0.08)",
                    fontSize: 12.5,
                  }}
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

        <ChartCard
          title="Delay Risk Trend"
          subtitle="Average predicted delay risk across monitored projects"
        >
          <div className="trend-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={delayTrend} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#trendFill)"
                  dot={{ r: 3, fill: "#1d4ed8", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#1a3fae", strokeWidth: 2, stroke: "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* High-risk projects */}
      <section>
        <SectionHeader
          title="High-Risk Projects"
          subtitle="Projects with high or critical predicted delay probability"
          actionLabel="View all projects"
          actionTo="/projects"
        />
        <ProjectTable projects={highRiskProjects} onRowClick={openProject} />
      </section>

      {/* State summary */}
      <section>
        <SectionHeader
          title="State Summary"
          subtitle="Monitored portfolio by state with high/critical concentration"
          actionLabel="Open risk analysis"
          actionTo="/risk-analysis"
        />
        <div className="state-grid">
          {stateSummary.map((row) => (
            <article className="card state-card" key={row.state}>
              <div className="state-head">
                <span className="state-name">{row.state}</span>
                <span className={`risk-badge risk-${row.tone}`}>
                  {row.riskPercent}%
                </span>
              </div>
              <span className="state-stats">
                <b>{row.projects}</b> projects ·{" "}
                <b>{row.highCritical}</b> high/critical
              </span>
              <div className="state-bar">
                <div
                  className={`state-bar-fill bar-${row.tone}`}
                  style={{ width: `${row.riskPercent}%` }}
                />
              </div>
              <span className="state-caption">Avg delay risk score</span>
            </article>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <SectionHeader
          title="Quick Actions"
          subtitle="Jump to frequently used review workflows"
        />
        <div className="qa-grid">
          {quickActions.map((action) => (
            <QuickAction
              key={action.id}
              to={action.to}
              icon={ACTION_ICONS[action.icon]}
              title={action.title}
              description={action.description}
              tone={action.tone}
            />
          ))}
        </div>
      </section>
    </>
  );
}
