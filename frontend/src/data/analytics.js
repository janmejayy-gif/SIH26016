// ---------------------------------------------------------------------------
// LADI Portal — Analytics mock data (Phase 2)
// ---------------------------------------------------------------------------

export const riskOverviewCards = [
  {
    id: "objections",
    label: "Landowner Objections",
    value: "72%",
    support: "47 projects flagged",
    tone: "red",
  },
  {
    id: "litigation",
    label: "Litigation",
    value: "64%",
    support: "38 active cases",
    tone: "orange",
  },
  {
    id: "compensation",
    label: "Compensation Disputes",
    value: "58%",
    support: "31 projects affected",
    tone: "amber",
  },
  {
    id: "survey",
    label: "Survey Backlog",
    value: "41%",
    support: "22 parcels pending resurvey",
    tone: "amber",
  },
  {
    id: "overall",
    label: "Overall Delay Risk",
    value: "64%",
    support: "+6 pts vs last quarter · rising",
    tone: "navy",
  },
];

export const delayDrivers = [
  {
    factor: "Landowner objections",
    affectedProjects: 47,
    severity: "High",
    share: 72,
    mitigation:
      "Constitute joint negotiation panels; fast-track grievance hearings within 15 days.",
  },
  {
    factor: "Litigation",
    affectedProjects: 38,
    severity: "High",
    share: 64,
    mitigation:
      "Engage state legal cells; pursue out-of-court settlement for clustered cases.",
  },
  {
    factor: "Compensation disputes",
    affectedProjects: 31,
    severity: "Medium",
    share: 58,
    mitigation:
      "Switch to DBT compensation with a strict 90-day disbursement SLA.",
  },
  {
    factor: "Survey backlog",
    affectedProjects: 22,
    severity: "Medium",
    share: 41,
    mitigation:
      "Deploy drone-based survey squads to clear backlog in two phases.",
  },
  {
    factor: "Utility relocation",
    affectedProjects: 14,
    severity: "Low",
    share: 27,
    mitigation:
      "Pre-align utility shifting with discoms during the DPR stage itself.",
  },
];

export const avgDelayByCategory = [
  { category: "Low", months: 1.6 },
  { category: "Medium", months: 4.1 },
  { category: "High", months: 7.8 },
  { category: "Critical", months: 11.4 },
];

export const stateDelayRisk = [
  { state: "Uttar Pradesh", short: "UP", risk: 66, tone: "#dc2626" },
  { state: "Maharashtra", short: "MH", risk: 58, tone: "#ea580c" },
  { state: "Rajasthan", short: "RJ", risk: 52, tone: "#d97706" },
  { state: "Madhya Pradesh", short: "MP", risk: 49, tone: "#d97706" },
  { state: "Bihar", short: "BR", risk: 44, tone: "#16a34a" },
];
