// ---------------------------------------------------------------------------
// LADI Portal — Project register mock data (Phase 1)
// ---------------------------------------------------------------------------

export const allProjects = [
  {
    id: "LAD-UP-1042",
    name: "Lucknow–Sitapur Expressway (Package 3)",
    state: "Uttar Pradesh",
    risk: "Critical",
    probability: 92,
    expectedDelay: "~14 months",
    status: "Escalated",
  },
  {
    id: "LAD-MH-2043",
    name: "Nagpur–Mumbai Samruddhi Mahamarg (Parcel 8)",
    state: "Maharashtra",
    risk: "Critical",
    probability: 90,
    expectedDelay: "~12 months",
    status: "Escalated",
  },
  {
    id: "LAD-BR-0319",
    name: "Gaya–Dobhi Road Widening",
    state: "Bihar",
    risk: "Critical",
    probability: 88,
    expectedDelay: "~11 months",
    status: "Delayed",
  },
  {
    id: "LAD-MH-2187",
    name: "Pune Metro Line 3 — Land Handover",
    state: "Maharashtra",
    risk: "High",
    probability: 81,
    expectedDelay: "~9 months",
    status: "At Risk",
  },
  {
    id: "LAD-RJ-0554",
    name: "Jaipur Ring Road (Section 2)",
    state: "Rajasthan",
    risk: "High",
    probability: 77,
    expectedDelay: "~7 months",
    status: "Under Review",
  },
  {
    id: "LAD-UP-0987",
    name: "Varanasi Outer Bypass Extension",
    state: "Uttar Pradesh",
    risk: "High",
    probability: 74,
    expectedDelay: "~6 months",
    status: "At Risk",
  },
  {
    id: "LAD-BR-0462",
    name: "Patna Riverfront Development (Phase II)",
    state: "Bihar",
    risk: "Medium",
    probability: 61,
    expectedDelay: "~3 months",
    status: "Monitoring",
  },
  {
    id: "LAD-MP-1201",
    name: "Indore Smart City Drainage Corridor",
    state: "Madhya Pradesh",
    risk: "Medium",
    probability: 58,
    expectedDelay: "~4 months",
    status: "Monitoring",
  },
  {
    id: "LAD-MP-1330",
    name: "Bhopal Satellite Township Roads",
    state: "Madhya Pradesh",
    risk: "Low",
    probability: 31,
    expectedDelay: "< 2 months",
    status: "On Track",
  },
  {
    id: "LAD-RJ-0711",
    name: "Ajmer Smart City Water Works",
    state: "Rajasthan",
    risk: "Low",
    probability: 22,
    expectedDelay: "< 1 month",
    status: "On Track",
  },
];

export const highRiskProjects = allProjects
  .filter(
    (project) => project.risk === "High" || project.risk === "Critical"
  )
  .slice(0, 8);
