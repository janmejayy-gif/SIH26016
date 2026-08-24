const express = require("express");
const cors = require("cors");
const { projects, alerts, analytics } = require("./data/mockData.js");

const RISK_FACTOR_WEIGHTS = {
  landownerObjections: 22,
  litigationCases: 18,
  compensationDisputes: 18,
  surveyBacklog: 12,
  utilityRelocation: 8,
  environmentalClearance: 8,
  accessIssues: 6,
  documentationIssues: 6,
};

const RISK_FACTOR_LABELS = {
  landownerObjections: "Landowner Objections",
  litigationCases: "Litigation",
  compensationDisputes: "Compensation Disputes",
  surveyBacklog: "Survey Backlog",
  utilityRelocation: "Utility Relocation",
  environmentalClearance: "Environmental Clearance",
  accessIssues: "Access/Easement Issues",
  documentationIssues: "Documentation Issues",
};

function getSeverityFromContribution(contribution) {
  if (contribution >= 15) return "High";
  if (contribution >= 10) return "Medium";
  return "Low";
}

function predictProjectRisk(project) {
  let total = 0;
  for (const [key, weight] of Object.entries(RISK_FACTOR_WEIGHTS)) {
    const value = project[key] !== undefined ? Number(project[key]) : 0;
    total += value * weight;
  }
  return Math.min(100, Math.max(0, Math.round(total / 100)));
}

function getRiskLevel(score) {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

function predictDelayDays(riskScore, status) {
  if (riskScore <= 24) return Math.round(30 * riskScore / 24);
  if (riskScore <= 49) return Math.round(30 + (riskScore - 25) * 60 / 24);
  if (riskScore <= 74) return Math.round(90 + (riskScore - 50) * 90 / 24);
  return Math.round(180 + (riskScore - 75) * 30 / 5);
}

function getRiskDrivers(project) {
  const drivers = [];
  for (const [key, weight] of Object.entries(RISK_FACTOR_WEIGHTS)) {
    const level = project[key] !== undefined ? Number(project[key]) : 0;
    const contribution = Math.round(level * RISK_FACTOR_WEIGHTS[key] / 100);
    drivers.push({
      key,
      label: RISK_FACTOR_LABELS[key] || key,
      weight,
      level,
      contribution,
      severity: contribution >= 15 ? "High" : contribution >= 10 ? "Medium" : "Low",
    });
  }
  drivers.sort((a, b) => b.contribution - a.contribution);
  return drivers.slice(0, 5);
}

function predictProject(project) {
  const score = predictProjectRisk(project);
  const level = getRiskLevel(score);
  const delayDays = predictDelayDays(score, project.status || "Monitoring");
  const drivers = getRiskDrivers(project);
  const primaryFactor = drivers.length > 0 ? drivers[0].key : null;
  const recs = {
    landownerObjections: "Schedule stakeholder consultation and prioritize resolution of outstanding objections.",
    litigationCases: "Escalate active litigation cases and initiate legal review.",
    compensationDisputes: "Prioritize compensation resolution for affected landowners.",
    surveyBacklog: "Deploy additional survey teams to clear the pending backlog.",
    utilityRelocation: "Coordinate with utility agencies and establish a relocation timeline.",
    environmentalClearance: "Escalate pending environmental approvals for expedited review.",
    accessIssues: "Resolve access/easement issues and establish right-of-way agreements.",
    documentationIssues: "Complete pending documentation verification and update project records.",
  };
  const recommended = primaryFactor ? recs[primaryFactor] : "No significant risk factors identified.";

  return {
    projectId: project.id,
    predictedDelayRisk: score,
    riskLevel: level,
    expectedDelayDays: delayDays,
    confidence: 85,
    primaryFactor: drivers[0]?.key || null,
    factors: {
      landownerObjections: project.landownerObjections,
      litigationCases: project.litigationCases,
      compensationDisputes: project.compensationDisputes,
      surveyBacklog: project.surveyBacklog,
      utilityRelocation: project.utilityRelocation,
      environmentalClearance: project.environmentalClearance,
      accessIssues: project.accessIssues,
      documentationIssues: project.documentationIssues,
    },
    recommendedAction: primaryFactor ? recs[drivers[0]?.key] : "No significant risk factors identified.",
  };
}

function predictPortfolioSummary(projects) {
  const scores = projects.map(p => predictProjectRisk(p));
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const criticalCount = scores.filter(s => s >= 75).length;
  const highCount = scores.filter(s => s >= 50 && s < 75).length;
  const avgDelay = Math.round(
    projects.reduce((sum, p) => sum + predictDelayDays(predictProjectRisk(p), p.status || "Monitoring"), 0) / projects.length
  );
  return {
    averagePredictedRisk: avgScore,
    criticalProjects: criticalCount,
    highProjects: highCount,
    totalProjects: projects.length,
    averageExpectedDelayDays: avgDelay,
  };
}

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "LADI Backend", timestamp: new Date().toISOString() });
});

app.get("/api/projects", (req, res) => {
  const { state, risk, q } = req.query;
  let list = projects;
  if (state) list = list.filter((p) => p.state === state);
  if (risk) list = list.filter((p) => p.risk === risk);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((p) => [p.name, p.id, p.state, p.district].join(" ").toLowerCase().includes(needle));
  }
  res.json(list);
});

app.get("/api/projects/:id", (req, res) => {
  const project = projects.find((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (!project) return res.status(404).json({ error: "Project not found", id: req.params.id });
  res.json(project);
});

app.get("/api/alerts", (_req, res) => res.json(alerts));

app.get("/api/analytics", (_req, res) => res.json(analytics));

app.get("/api/predictions", (_req, res) => {
  const predictions = projects.map(p => {
    const score = predictProjectRisk(p);
    const level = getRiskLevel(score);
    const delayDays = predictDelayDays(score, p.status || "Monitoring");
    const drivers = getRiskDrivers(p);
    const primaryFactor = drivers.length > 0 ? drivers[0].key : null;
    const recs = {
      landownerObjections: "Schedule stakeholder consultation and prioritize resolution of outstanding objections.",
      litigationCases: "Escalate active litigation cases and initiate legal review.",
      compensationDisputes: "Prioritize compensation resolution for affected landowners.",
      surveyBacklog: "Deploy additional survey teams to clear the pending backlog.",
      utilityRelocation: "Coordinate with utility agencies and establish a relocation timeline.",
      environmentalClearance: "Escalate pending environmental approvals for expedited review.",
      accessIssues: "Resolve access/easement issues and establish right-of-way agreements.",
      documentationIssues: "Complete pending documentation verification and update project records.",
    };
    return {
      projectId: p.id,
      predictedDelayRisk: score,
      riskLevel: getRiskLevel(score),
      expectedDelayDays: predictDelayDays(score, p.status || "Monitoring"),
      confidence: 85,
      primaryFactor: drivers[0]?.key || null,
      factors: { landownerObjections: p.landownerObjections, litigationCases: p.litigationCases, compensationDisputes: p.compensationDisputes, surveyBacklog: p.surveyBacklog, utilityRelocation: p.utilityRelocation, environmentalClearance: p.environmentalClearance, accessIssues: p.accessIssues, documentationIssues: p.documentationIssues },
      recommendedAction: drivers[0] ? recs[drivers[0].key] : "No significant risk factors.",
    };
  });
  res.json(predictions);
});

app.get("/api/predictions/:id", (req, res) => {
  const project = projects.find((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (!project) return res.status(404).json({ error: "Project not found", id: req.params.id });
  const score = predictProjectRisk(project);
  const level = getRiskLevel(score);
  const delayDays = predictDelayDays(score, project.status || "Monitoring");
  const drivers = getRiskDrivers(project);
  const primaryFactor = drivers.length > 0 ? drivers[0].key : null;
  const recs = {
    landownerObjections: "Schedule stakeholder consultation and prioritize resolution of outstanding objections.",
    litigationCases: "Escalate active litigation cases and initiate legal review.",
    compensationDisputes: "Prioritize compensation resolution for affected landowners.",
    surveyBacklog: "Deploy additional survey teams to clear the pending backlog.",
    utilityRelocation: "Coordinate with utility agencies and establish a relocation timeline.",
    environmentalClearance: "Escalate pending environmental approvals for expedited review.",
    accessIssues: "Resolve access/easement issues and establish right-of-way agreements.",
    documentationIssues: "Complete pending documentation verification and update project records.",
  };
  res.json({
    projectId: project.id,
    predictedDelayRisk: score,
    riskLevel: level,
    expectedDelayDays: delayDays,
    confidence: 85,
    primaryFactor: drivers[0]?.key || null,
    factors: { landownerObjections: project.landownerObjections, litigationCases: project.litigationCases, compensationDisputes: project.compensationDisputes, surveyBacklog: project.surveyBacklog, utilityRelocation: project.utilityRelocation, environmentalClearance: project.environmentalClearance, accessIssues: project.accessIssues, documentationIssues: project.documentationIssues },
    recommendedAction: primaryFactor ? recs[primaryFactor] : "No significant risk factors identified.",
  });
});

app.get("/", (_req, res) => {
  res.json({
    service: "LADI Backend",
    version: "0.3.0",
    phase: "Phase 3 build",
    endpoints: ["/api/health", "/api/projects", "/api/projects/:id", "/api/alerts", "/api/analytics", "/api/predictions", "/api/predictions/:id"],
  });
});

app.listen(PORT, () => console.log(`[LADI Backend] listening on http://localhost:${PORT}`));