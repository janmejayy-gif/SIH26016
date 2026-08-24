// ---------------------------------------------------------------------------
// LADI Portal — Predictive Risk Engine (Phase 3)
// Deterministic mock model; no external ML or APIs.
// Used to compute predicted risk, delay, drivers and recommendations
// from the project factor levels added in Phase 3.
// ---------------------------------------------------------------------------

// Factor weights — these sum to 100 and determine each factor's contribution
// to the overall risk score.
export const RISK_FACTOR_WEIGHTS = {
  landownerObjections: 22,
  litigationCases: 18,
  compensationDisputes: 18,
  surveyBacklog: 12,
  utilityRelocation: 8,
  environmentalClearance: 8,
  accessIssues: 6,
  documentationIssues: 6,
};

// Human-readable factor labels
export const RISK_FACTOR_LABELS = {
  landownerObjections: "Landowner Objections",
  litigationCases: "Litigation",
  compensationDisputes: "Compensation Disputes",
  surveyBacklog: "Survey Backlog",
  utilityRelocation: "Utility Relocation",
  environmentalClearance: "Environmental Clearance",
  accessIssues: "Access/Easement Issues",
  documentationIssues: "Documentation Issues",
};

/** severity classification per contribution value */
export function getSeverityFromContribution(contribution) {
  if (contribution >= 15) return "High";
  if (contribution >= 10) return "Medium";
  return "Low";
}

/** Compute a predicted delay risk score from 0–100 for a project,
 * using a transparent weighted model from the project's factor levels.
 *
 * The same project with the same factor levels will always produce the
 * same score — the model is deterministic. */
export function predictProjectRisk(project) {
  let total = 0;
  for (const [key, weight] of Object.entries(RISK_FACTOR_WEIGHTS)) {
    const value = project[key] !== undefined ? Number(project[key]) : 0;
    total += value * weight;
  }
  return Math.min(100, Math.max(0, Math.round(total / 100)));
}

/** Return the risk level name for a 0–100 score. */
export function getRiskLevel(score) {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

/** Determine expected delay days from the risk score and project status. */
export function predictDelayDays(riskScore, status) {
  if (riskScore <= 24) return Math.round(30 * riskScore / 24);       // 0–30
  if (riskScore <= 49) return Math.round(30 + (riskScore - 25) * 60 / 24); // 30–90
  if (riskScore <= 74) return Math.round(90 + (riskScore - 50) * 90 / 24); // 90–180
  return Math.round(180 + (riskScore - 75) * 30 / 5);                 // 180+
}

/** Return the top risk drivers for a project, sorted by contribution. */
export function getRiskDrivers(project) {
  const drivers = [];
  for (const [key, weight] of Object.entries(RISK_FACTOR_WEIGHTS)) {
    const level = project[key] !== undefined ? Number(project[key]) : 0;
    const contribution = Math.round(level * weight / 100);
    drivers.push({
      key,
      label: RISK_FACTOR_LABELS[key] || key,
      weight,
      level,
      contribution,
      severity: getSeverityFromContribution(contribution),
    });
  }
  drivers.sort((a, b) => b.contribution - a.contribution);
  return drivers.slice(0, 5);
}

/** Generate a human-readable recommended action based on the strongest
 * risk driver (highest contribution). */
export function getRecommendedAction(project) {
  const drivers = getRiskDrivers(project);
  const top = drivers[0];
  if (!top) return "No significant risk factors identified.";

  const recs = {
    landownerObjections:
      "Schedule stakeholder consultation and prioritize resolution of outstanding objections.",
    litigationCases:
      "Escalate active litigation cases and initiate legal review.",
    compensationDisputes:
      "Prioritize compensation resolution for affected landowners.",
    surveyBacklog:
      "Deploy additional survey teams to clear the pending backlog.",
    utilityRelocation:
      "Coordinate with utility agencies and establish a relocation timeline.",
    environmentalClearance:
      "Escalate pending environmental approvals for expedited review.",
    accessIssues:
      "Resolve access/easement issues and establish right-of-way agreements.",
    documentationIssues:
      "Complete pending documentation verification and update project records.",
  };
  return recs[top.key] || "Review the identified risk factors and consult the project stakeholder.";
}

/** Return a confidence score (0–100) reflecting how many factor levels
 * are defined for this project. */
export function getConfidence(project) {
  const factorKeys = Object.keys(RISK_FACTOR_WEIGHTS);
  const defined = factorKeys.filter(key => project[key] !== undefined).length;
  return Math.round((defined / factorKeys.length) * 100);
}

/** Predict the full risk profile for a project.
 * Returns an object with all predictive metrics. */
export function predictProject(project) {
  const score = predictProjectRisk(project);
  const level = getRiskLevel(score);
  const delayDays = predictDelayDays(score, project.status || "Monitoring");
  const drivers = getRiskDrivers(project);
  const primaryFactor = drivers.length > 0 ? drivers[0].key : null;
  const recommended = getRecommendedAction(project);
  const confidence = getConfidence(project);

  return {
    projectId: project.id,
    predictedDelayRisk: score,
    riskLevel: level,
    expectedDelayDays: delayDays,
    confidence,
    primaryFactor: primaryFactor,
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
    recommendedAction: recommended,
  };
}

/** Predict the portfolio-level outlook for an array of projects. */
export function predictPortfolio(projects) {
  const scores = projects.map(p => predictProjectRisk(p));
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const criticalCount = scores.filter(s => s >= 75).length;
  const highCount = scores.filter(s => s >= 50 && s < 75).length;
  return {
    averagePredictedRisk: avgScore,
    criticalProjects: criticalCount,
    highProjects: highCount,
  };
}

/** Predict the portfolio-level summary including average expected delay. */
export function predictPortfolioSummary(projects) {
  const scores = projects.map(p => predictProjectRisk(p));
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const criticalCount = scores.filter(s => s >= 75).length;
  const highCount = scores.filter(s => s >= 50 && s < 75).length;

  // Compute average expected delay days
  const avgDelay = Math.round(
    projects.reduce((sum, p) => sum + predictDelayDays(predictProjectRisk(p), p.status || "Monitoring"), 0) /
      projects.length
  );

  return {
    averagePredictedRisk: avgScore,
    criticalProjects: criticalCount,
    highProjects: highCount,
    totalProjects: projects.length,
    averageExpectedDelayDays: avgDelay,
  };
}