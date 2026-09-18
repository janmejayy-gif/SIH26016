const express = require("express");
const cors = require("cors");
const { projects, alerts, analytics } = require("./data/mockData.js");
const { proposals, getNextId } = require("./data/proposals.js");

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

// Proposal API endpoints
app.get("/api/proposals", (req, res) => {
  const { state, projectType, status, q, sortBy } = req.query;
  let list = proposals;
  if (state) list = list.filter((p) => p.state === state);
  if (projectType) list = list.filter((p) => p.projectType === projectType);
  if (status) list = list.filter((p) => p.status === status);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((p) => [p.projectName, p.id, p.state, p.district, p.department].join(" ").toLowerCase().includes(needle));
  }
  if (sortBy) {
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "submitted-asc":
          return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
        case "submitted-desc":
          return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
        case "name-asc":
          return a.projectName.localeCompare(b.projectName);
        case "name-desc":
          return b.projectName.localeCompare(a.projectName);
        case "status-asc":
          return a.status.localeCompare(b.status);
        case "status-desc":
          return b.status.localeCompare(a.status);
        case "stage-asc":
          return a.currentStage.localeCompare(b.currentStage);
        case "stage-desc":
          return b.currentStage.localeCompare(a.currentStage);
        default:
          return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
      }
    });
  } else {
    list = [...list].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  }
  res.json(list);
});

app.get("/api/proposals/:id", (req, res) => {
  const proposal = proposals.find((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (!proposal) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  res.json(proposal);
});

app.post("/api/proposals", (req, res) => {
  // Auto-generate classification if not provided
  let classification = req.body.classification;
  if (!classification || !classification.category) {
    const projectType = req.body.projectType;
    const landType = req.body.landType;
    const estimatedCost = Number(req.body.estimatedCost) || 0;
    const estimatedLandRequirement = Number(req.body.estimatedLandRequirement) || 0;
    const expectedParcels = Number(req.body.expectedParcels) || 0;
    
    const categoryMap = {
      "National Highway": "Transport Infrastructure",
      "Railway": "Rail Infrastructure",
      "Industrial Project": "Industrial Development",
      "Irrigation": "Irrigation & Water Resources",
      "Power Infrastructure": "Power & Energy",
      "Urban Development": "Urban Development",
      "Defence Infrastructure": "Defence Infrastructure",
      "Other": "Other",
    };
    
    const landTypeMap = {
      "Government": "Government Land",
      "Private": "Private Land",
      "Mixed": "Mixed Land",
    };
    
    let projectScale = "Small";
    if (estimatedCost >= 5000000000 || estimatedLandRequirement >= 500 || expectedParcels >= 500) projectScale = "Major";
    else if (estimatedCost >= 2000000000 || estimatedLandRequirement >= 200 || expectedParcels >= 200) projectScale = "Large";
    else if (estimatedCost >= 500000000 || estimatedLandRequirement >= 50 || expectedParcels >= 50) projectScale = "Medium";
    
    let complexityScore = 0;
    if (estimatedLandRequirement >= 500) complexityScore += 3;
    else if (estimatedLandRequirement >= 200) complexityScore += 2;
    else if (estimatedLandRequirement >= 50) complexityScore += 1;
    if (expectedParcels >= 500) complexityScore += 3;
    else if (expectedParcels >= 200) complexityScore += 2;
    else if (expectedParcels >= 50) complexityScore += 1;
    if (landType === "Private") complexityScore += 2;
    else if (landType === "Mixed") complexityScore += 1;
    
    let acquisitionComplexity = "Low";
    if (complexityScore >= 6) acquisitionComplexity = "Critical";
    else if (complexityScore >= 4) acquisitionComplexity = "High";
    else if (complexityScore >= 2) acquisitionComplexity = "Medium";
    
    const authorityLevels = [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
      { level: 4, name: "Final Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
    ];
    
    classification = {
      category: categoryMap[projectType] || "Other",
      projectType: projectType,
      landAcquisitionType: landTypeMap[landType] || "Mixed Land",
      projectScale: projectScale,
      acquisitionComplexity: acquisitionComplexity,
      status: "Pending",
      remarks: "Awaiting classification",
      classifiedBy: null,
      classifiedAt: null,
      isAutoClassified: false,
      authorityLevels: authorityLevels,
    };
  }
  
  const newProposal = {
    ...req.body,
    id: getNextId(),
    status: "Draft",
    currentStage: "Registration",
    submittedAt: null,
    updatedAt: new Date().toISOString(),
    classification: classification,
    workflowHistory: [
      { stage: "Registration", status: "Draft", at: new Date().toISOString(), by: "System", remarks: "Draft saved" },
    ],
  };
  proposals.push(newProposal);
  res.status(201).json(newProposal);
});

app.put("/api/proposals/:id", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const updated = { ...proposals[index], ...req.body, updatedAt: new Date().toISOString() };
  proposals[index] = updated;
  res.json(updated);
});

app.post("/api/proposals/:id/submit", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const proposal = proposals[index];
  if (proposal.status !== "Draft") {
    return res.status(400).json({ error: "Only draft proposals can be submitted" });
  }
  proposal.status = "Submitted";
  proposal.currentStage = "Registration";
  proposal.submittedAt = new Date().toISOString();
  proposal.updatedAt = new Date().toISOString();
  proposal.workflowHistory.push({
    stage: "Registration",
    status: "In Progress",
    at: new Date().toISOString(),
    by: "System",
    remarks: "Proposal submitted for registration",
  });
  res.json(proposal);
});

app.post("/api/proposals/:id/approve", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const proposal = proposals[index];
  const { authorityLevel, officer, designation, remarks } = req.body;
  
  // Find and update the authority level
  const authLevel = proposal.classification.authorityLevels.find((a) => a.level === authorityLevel);
  if (!authLevel) {
    return res.status(400).json({ error: "Invalid authority level" });
  }
  
  authLevel.status = "Approved";
  authLevel.officer = officer || authLevel.officer;
  authLevel.designation = designation || authLevel.designation;
  authLevel.remarks = remarks || "";
  authLevel.actionAt = new Date().toISOString();
  
  proposal.updatedAt = new Date().toISOString();
  
  // Add to workflow history
  const stageNames = {
    1: "Hierarchy Verification",
    2: "Hierarchy Verification",
    3: "Hierarchy Verification",
    4: "Hierarchy Verification",
  };
  proposal.workflowHistory.push({
    stage: stageNames[authorityLevel] || "Hierarchy Verification",
    status: "Completed",
    at: new Date().toISOString(),
    by: officer || "Officer",
    remarks: remarks || `Level ${authorityLevel} approved`,
  });
  
  // Check if all hierarchy levels are approved
  const allApproved = proposal.classification.authorityLevels.every((a) => a.status === "Approved");
  if (allApproved) {
    // All hierarchy levels approved - move to Officer Verification
    proposal.status = "Under Verification";
    proposal.currentStage = "Officer Verification";
    proposal.workflowHistory.push({
      stage: "Hierarchy Verification",
      status: "Completed",
      at: new Date().toISOString(),
      by: "System",
      remarks: "All hierarchy levels approved",
    });
  } else {
    // Move to next hierarchy level - keep stage as Hierarchy Verification
    const nextLevel = proposal.classification.authorityLevels.find((a) => a.status === "Pending");
    if (nextLevel) {
      nextLevel.status = "In Review";
      proposal.currentStage = "Hierarchy Verification";
      proposal.status = "Under Verification";
    }
  }
  
  res.json(proposal);
});

app.post("/api/proposals/:id/reject", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const proposal = proposals[index];
  const { authorityLevel, officer, designation, remarks } = req.body;
  
  if (!remarks || remarks.trim() === "") {
    return res.status(400).json({ error: "Rejection reason is required" });
  }
  
  const authLevel = proposal.classification.authorityLevels.find((a) => a.level === authorityLevel);
  if (!authLevel) {
    return res.status(400).json({ error: "Invalid authority level" });
  }
  
  authLevel.status = "Rejected";
  authLevel.officer = officer || authLevel.officer;
  authLevel.designation = designation || authLevel.designation;
  authLevel.remarks = remarks;
  authLevel.actionAt = new Date().toISOString();
  
  proposal.status = "Rejected";
  proposal.currentStage = "Rejected";
  proposal.updatedAt = new Date().toISOString();
  
  const stageNames = {
    1: "Hierarchy Verification",
    2: "Hierarchy Verification",
    3: "Hierarchy Verification",
    4: "Hierarchy Verification",
  };
  proposal.workflowHistory.push({
    stage: stageNames[authorityLevel] || "Hierarchy Verification",
    status: "Rejected",
    at: new Date().toISOString(),
    by: officer || "Officer",
    remarks: remarks,
  });
  
  res.json(proposal);
});

app.post("/api/proposals/:id/send-back", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const proposal = proposals[index];
  const { authorityLevel, officer, designation, remarks } = req.body;
  
  if (!remarks || remarks.trim() === "") {
    return res.status(400).json({ error: "Remarks are required for send back" });
  }
  
  const authLevel = proposal.classification.authorityLevels.find((a) => a.level === authorityLevel);
  if (!authLevel) {
    return res.status(400).json({ error: "Invalid authority level" });
  }
  
  authLevel.status = "Sent Back";
  authLevel.officer = officer || authLevel.officer;
  authLevel.designation = designation || authLevel.designation;
  authLevel.remarks = remarks;
  authLevel.actionAt = new Date().toISOString();
  
  proposal.status = "Sent Back";
  proposal.updatedAt = new Date().toISOString();
  
  const stageNames = {
    1: "Hierarchy Verification",
    2: "Hierarchy Verification",
    3: "Hierarchy Verification",
    4: "Hierarchy Verification",
  };
  proposal.workflowHistory.push({
    stage: stageNames[authorityLevel] || "Hierarchy Verification",
    status: "Sent Back",
    at: new Date().toISOString(),
    by: officer || "Officer",
    remarks: remarks,
  });
  
  res.json(proposal);
});

app.post("/api/proposals/:id/resubmit", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const proposal = proposals[index];
  
  if (proposal.status !== "Sent Back") {
    return res.status(400).json({ error: "Only sent back proposals can be resubmitted" });
  }
  
  // Reset the authority level that sent it back to In Review
  const sentBackLevel = proposal.classification.authorityLevels.find((a) => a.status === "Sent Back");
  if (sentBackLevel) {
    sentBackLevel.status = "In Review";
    sentBackLevel.remarks = "";
    sentBackLevel.actionAt = null;
  }
  
  proposal.status = "Under Verification";
  proposal.currentStage = "Hierarchy Verification";
  proposal.updatedAt = new Date().toISOString();
  
  proposal.workflowHistory.push({
    stage: "Hierarchy Verification",
    status: "In Progress",
    at: new Date().toISOString(),
    by: "System",
    remarks: "Proposal resubmitted after corrections",
  });
  
  res.json(proposal);
});

// Classification API endpoint
app.put("/api/proposals/:id/classification", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const proposal = proposals[index];
  
  const { category, projectType, landAcquisitionType, projectScale, acquisitionComplexity, status, remarks } = req.body;
  
  // Required fields validation
  if (!category || !projectType || !landAcquisitionType || !projectScale || !acquisitionComplexity) {
    return res.status(400).json({ error: "All classification fields are required: category, projectType, landAcquisitionType, projectScale, acquisitionComplexity" });
  }
  
  // Update classification
  proposal.classification = {
    ...proposal.classification,
    category,
    projectType,
    landAcquisitionType,
    projectScale,
    acquisitionComplexity,
    status: status || "Classified",
    remarks: remarks || "",
    classifiedBy: "Admin User", // In real implementation, get from auth
    classifiedAt: new Date().toISOString(),
    isAutoClassified: false,
  };
  
  proposal.updatedAt = new Date().toISOString();
  
  // Add to workflow history if classification status changed to Classified
  if (status === "Classified" || proposal.classification.status === "Classified") {
    proposal.workflowHistory.push({
      stage: "Classification",
      status: "Completed",
      at: new Date().toISOString(),
      by: "Admin User",
      remarks: remarks || "Project classified",
    });
    
    // Update proposal stage if currently in Classification
    if (proposal.currentStage === "Classification" || proposal.currentStage === "Registration") {
      proposal.currentStage = "Hierarchy Verification";
      proposal.status = "Under Verification";
    }
  }
  
  res.json(proposal);
});

// Hierarchy Configuration API endpoint
app.put("/api/proposals/:id/hierarchy", (req, res) => {
  const index = proposals.findIndex((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: "Proposal not found", id: req.params.id });
  const proposal = proposals[index];
  
  const { authorityLevels } = req.body;
  
  if (!authorityLevels || !Array.isArray(authorityLevels)) {
    return res.status(400).json({ error: "authorityLevels array is required" });
  }
  
  // Validate each authority level
  for (const auth of authorityLevels) {
    if (!auth.name || !auth.designation) {
      return res.status(400).json({ error: "Each authority level must have name and designation" });
    }
  }
  
  // Update authority levels
  proposal.classification.authorityLevels = authorityLevels.map((auth, idx) => ({
    ...proposal.classification.authorityLevels[idx],
    ...auth,
    level: idx + 1, // Ensure level is correct
  }));
  
  proposal.updatedAt = new Date().toISOString();
  
  // Add to workflow history
  proposal.workflowHistory.push({
    stage: "Hierarchy Verification",
    status: "In Progress",
    at: new Date().toISOString(),
    by: "Admin User",
    remarks: "Authority hierarchy configured",
  });
  
  // If proposal is in Registration or Classification, move to Hierarchy Verification
  if (proposal.currentStage === "Registration" || proposal.currentStage === "Classification") {
    proposal.currentStage = "Hierarchy Verification";
    proposal.status = "Under Verification";
    
    // Set first level to In Review
    if (proposal.classification.authorityLevels.length > 0) {
      proposal.classification.authorityLevels[0].status = "In Review";
    }
  }
  
  res.json(proposal);
});

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
    version: "0.4.0",
    phase: "Phase A - Proposal Module",
    endpoints: [
      "/api/health",
      "/api/projects",
      "/api/projects/:id",
      "/api/alerts",
      "/api/analytics",
      "/api/predictions",
      "/api/predictions/:id",
      "/api/proposals",
      "/api/proposals/:id",
      "/api/proposals (POST)",
      "/api/proposals/:id (PUT)",
      "/api/proposals/:id/submit",
      "/api/proposals/:id/approve",
      "/api/proposals/:id/reject",
      "/api/proposals/:id/send-back",
      "/api/proposals/:id/resubmit",
    ],
  });
});

app.listen(PORT, () => console.log(`[LADI Backend] listening on http://localhost:${PORT}`));