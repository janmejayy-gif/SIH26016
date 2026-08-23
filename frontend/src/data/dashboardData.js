// ---------------------------------------------------------------------------
// LADI Portal — Dashboard mock data (Phase 1)
// All figures are illustrative mock values for demonstration purposes only.
// ---------------------------------------------------------------------------

export const kpiCards = [
  {
    id: "total",
    label: "Total Projects",
    value: "248",
    support: "Across 18 states · +12 this quarter",
    progress: 100,
    icon: "layers",
    tone: "blue",
  },
  {
    id: "low",
    label: "Low Risk",
    value: "92",
    support: "37% of portfolio · on schedule",
    progress: 37,
    icon: "shieldCheck",
    tone: "green",
  },
  {
    id: "medium",
    label: "Medium Risk",
    value: "76",
    support: "31% of portfolio · watch indicators active",
    progress: 31,
    icon: "eye",
    tone: "amber",
  },
  {
    id: "high",
    label: "High Risk",
    value: "51",
    support: "21% of portfolio · escalation review advised",
    progress: 21,
    icon: "alertTriangle",
    tone: "orange",
  },
  {
    id: "critical",
    label: "Critical Risk",
    value: "29",
    support: "12% of portfolio · immediate action required",
    progress: 12,
    icon: "siren",
    tone: "red",
  },
  {
    id: "average",
    label: "Average Delay Risk",
    value: "64%",
    support: "+6 pts vs last quarter · rising trend",
    progress: 64,
    icon: "trendingUp",
    tone: "navy",
  },
];

export const riskDistribution = [
  { name: "Low", value: 92, color: "#16a34a" },
  { name: "Medium", value: 76, color: "#d97706" },
  { name: "High", value: 51, color: "#ea580c" },
  { name: "Critical", value: 29, color: "#dc2626" },
];

export const riskDistributionTotal = riskDistribution.reduce(
  (sum, item) => sum + item.value,
  0
);

export const delayTrend = [
  { month: "Mar", risk: 48 },
  { month: "Apr", risk: 52 },
  { month: "May", risk: 55 },
  { month: "Jun", risk: 59 },
  { month: "Jul", risk: 62 },
  { month: "Aug", risk: 64 },
];

export const stateSummary = [
  {
    state: "Uttar Pradesh",
    projects: 48,
    highCritical: 17,
    riskPercent: 66,
    tone: "red",
  },
  {
    state: "Maharashtra",
    projects: 39,
    highCritical: 11,
    riskPercent: 58,
    tone: "orange",
  },
  {
    state: "Rajasthan",
    projects: 31,
    highCritical: 8,
    riskPercent: 52,
    tone: "amber",
  },
  {
    state: "Madhya Pradesh",
    projects: 27,
    highCritical: 7,
    riskPercent: 49,
    tone: "amber",
  },
  {
    state: "Bihar",
    projects: 22,
    highCritical: 6,
    riskPercent: 44,
    tone: "green",
  },
];

export const quickActions = [
  {
    id: "critical",
    title: "Review Critical Projects",
    description: "29 projects require immediate intervention review.",
    icon: "siren",
    to: "/projects",
    tone: "red",
  },
  {
    id: "alerts",
    title: "View All Alerts",
    description: "5 active early-warning alerts across monitored states.",
    icon: "bell",
    to: "/alerts",
    tone: "amber",
  },
  {
    id: "risk",
    title: "Open Risk Analysis",
    description: "Inspect district-level delay probability drivers.",
    icon: "gauge",
    to: "/risk-analysis",
    tone: "blue",
  },
  {
    id: "map",
    title: "Open Map",
    description: "Geographic view of acquisition hotspots by state.",
    icon: "mapPin",
    to: "/map",
    tone: "green",
  },
];
