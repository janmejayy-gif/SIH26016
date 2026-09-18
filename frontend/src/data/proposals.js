// ---------------------------------------------------------------------------
// LADI Portal — Project Proposal mock data (Phase A)
// ---------------------------------------------------------------------------

export const PROPOSAL_STATUSES = [
  "Draft",
  "Submitted",
  "Under Verification",
  "Sent Back",
  "Rejected",
  "Approved",
];

export const PROPOSAL_STAGES = [
  "Registration",
  "Classification",
  "Hierarchy Verification",
  "Officer Verification",
  "Final Approval",
];

export const CLASSIFICATION_STATUSES = [
  "Pending",
  "In Progress",
  "Classified",
  "Needs Review",
];

export const PROJECT_CATEGORIES = [
  "Transport Infrastructure",
  "Rail Infrastructure",
  "Irrigation & Water Resources",
  "Power & Energy",
  "Industrial Development",
  "Urban Development",
  "Defence Infrastructure",
  "Other",
];

export const LAND_ACQUISITION_TYPES = [
  "Private Land",
  "Government Land",
  "Mixed Land",
];

export const PROJECT_SCALES = [
  "Small",
  "Medium",
  "Large",
  "Major",
];

export const ACQUISITION_COMPLEXITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const PROJECT_TYPE_TO_CATEGORY = {
  "National Highway": "Transport Infrastructure",
  "Railway": "Rail Infrastructure",
  "Industrial Project": "Industrial Development",
  "Irrigation": "Irrigation & Water Resources",
  "Power Infrastructure": "Power & Energy",
  "Urban Development": "Urban Development",
  "Defence Infrastructure": "Defence Infrastructure",
  "Other": "Other",
};

export const PROJECT_TYPES = [
  "National Highway",
  "Railway",
  "Industrial Project",
  "Irrigation",
  "Power Infrastructure",
  "Urban Development",
  "Defence Infrastructure",
  "Other",
];

export const SUBMISSION_MODES = [
  "Manual Submission",
  "Existing Portal",
  "Government API",
];

export const LAND_TYPES = [
  "Government",
  "Private",
  "Mixed",
];

export const UNITS = [
  "hectare",
  "acre",
];

export const DOCUMENT_TYPES = [
  "Project Proposal",
  "DPR",
  "Land Requirement Statement",
  "Preliminary Survey",
  "Administrative Approval",
  "Other Supporting Document",
];

export const AUTHORITY_LEVELS = [
  "Project Initiating Authority",
  "District-level Authority",
  "State-level Authority",
  "Final Authority",
];

export const HIERARCHY_AUTHORITY_STATUSES = [
  "Pending",
  "In Review",
  "Approved",
  "Rejected",
  "Sent Back",
];

// Generate unique proposal ID
export function generateProposalId() {
  const year = new Date().getFullYear();
  const stored = localStorage.getItem("ladi-proposal-counter");
  let counter = stored ? parseInt(stored, 10) : 0;
  counter += 1;
  localStorage.setItem("ladi-proposal-counter", counter.toString());
  return `LAD-PROP-${year}-${String(counter).padStart(4, "0")}`;
}

export const allProposals = [
  {
    id: "LAD-PROP-2026-0001",
    projectName: "Delhi–Mumbai Expressway (Package 7)",
    description: "Six-lane access-controlled expressway connecting Delhi to Mumbai via Rajasthan and Gujarat. Package 7 covers the section through Kota district.",
    projectType: "National Highway",
    department: "Ministry of Road Transport and Highways",
    state: "Rajasthan",
    district: "Kota",
    tehsil: "Ladpura",
    village: "Mandana",
    estimatedCost: 2450000000,
    estimatedLandRequirement: 185.5,
    unit: "hectare",
    expectedStartDate: "2026-10-15",
    expectedCompletionDate: "2028-12-31",
    purposeOfAcquisition: "Right of way for expressway construction including service roads and interchanges",
    requiredArea: 185.5,
    expectedParcels: 247,
    landType: "Mixed",
    locations: [
      {
        id: "loc-1",
        name: "Main Alignment - Mandana Village",
        latitude: 25.2138,
        longitude: 75.8648,
      },
      {
        id: "loc-2",
        name: "Interchange - Ramganj Mandi",
        latitude: 24.6432,
        longitude: 75.9391,
      },
    ],
    submissionMode: "Manual Submission",
    portalReferenceId: "",
    apiTransactionId: "",
    documents: [
      { id: "doc-1", type: "Project Proposal", name: "Delhi-Mumbai_Expressway_Pkg7_Proposal.pdf", uploadedAt: "2026-08-15T10:30:00" },
      { id: "doc-2", type: "DPR", name: "Detailed_Project_Report_Pkg7.pdf", uploadedAt: "2026-08-15T10:35:00" },
      { id: "doc-3", type: "Land Requirement Statement", name: "Land_Requirement_Statement_Pkg7.pdf", uploadedAt: "2026-08-16T09:15:00" },
      { id: "doc-4", type: "Preliminary Survey", name: "Preliminary_Survey_Report_Pkg7.pdf", uploadedAt: "2026-08-18T14:20:00" },
    ],
    status: "Approved",
    currentStage: "Final Approval",
    submittedAt: "2026-08-20T11:00:00",
    updatedAt: "2026-09-01T16:30:00",
    classification: {
      projectType: "National Highway",
      authorityLevels: [
        { level: 1, name: "Project Initiating Authority", officer: "R.K. Sharma", designation: "Chief Engineer (NH)", status: "Approved", remarks: "Approved as per alignment finalized", actionAt: "2026-08-22T10:00:00" },
        { level: 2, name: "District-level Authority", officer: "S. Meena", designation: "District Collector, Kota", status: "Approved", remarks: "Land acquisition feasible", actionAt: "2026-08-25T14:30:00" },
        { level: 3, name: "State-level Authority", officer: "A. Gupta", designation: "Principal Secretary, PWD", status: "Approved", remarks: "State budget allocation confirmed", actionAt: "2026-08-28T11:15:00" },
        { level: 4, name: "Final Authority", officer: "M. Singh", designation: "Secretary, MoRTH", status: "Approved", remarks: "Final approval granted", actionAt: "2026-09-01T16:30:00" },
      ],
    },
    workflowHistory: [
      { stage: "Registration", status: "Completed", at: "2026-08-20T11:00:00", by: "System", remarks: "Proposal registered" },
      { stage: "Classification", status: "Completed", at: "2026-08-21T09:30:00", by: "R.K. Sharma", remarks: "Classified as National Highway" },
      { stage: "Hierarchy Verification", status: "Completed", at: "2026-08-28T11:15:00", by: "A. Gupta", remarks: "All hierarchy levels verified" },
      { stage: "Officer Verification", status: "Completed", at: "2026-08-30T15:00:00", by: "M. Singh", remarks: "Officer verification complete" },
      { stage: "Final Approval", status: "Completed", at: "2026-09-01T16:30:00", by: "M. Singh", remarks: "Final approval granted" },
    ],
  },
  {
    id: "LAD-PROP-2026-0002",
    projectName: "Western Dedicated Freight Corridor (Rewari–Dadri Section)",
    description: "Double-line electrified freight corridor parallel to existing tracks. Section through Haryana and Uttar Pradesh.",
    projectType: "Railway",
    department: "Ministry of Railways",
    state: "Haryana",
    district: "Rewari",
    tehsil: "Bawal",
    village: "Nangal Pathani",
    estimatedCost: 1850000000,
    estimatedLandRequirement: 142.3,
    unit: "hectare",
    expectedStartDate: "2026-11-01",
    expectedCompletionDate: "2029-03-31",
    purposeOfAcquisition: "Freight corridor right of way, station yards, and maintenance depots",
    requiredArea: 142.3,
    expectedParcels: 189,
    landType: "Private",
    locations: [
      {
        id: "loc-1",
        name: "Main Alignment - Nangal Pathani",
        latitude: 28.1234,
        longitude: 76.5432,
      },
    ],
    submissionMode: "Existing Portal",
    portalReferenceId: "WDFC-NR-2026-0456",
    apiTransactionId: "",
    documents: [
      { id: "doc-1", type: "Project Proposal", name: "WDFC_Rewari_Dadri_Proposal.pdf", uploadedAt: "2026-08-25T14:00:00" },
      { id: "doc-2", type: "DPR", name: "WDFC_DPR_Section3.pdf", uploadedAt: "2026-08-25T14:10:00" },
      { id: "doc-3", type: "Land Requirement Statement", name: "WDFC_Land_Req_Rewari.pdf", uploadedAt: "2026-08-26T10:00:00" },
    ],
    status: "Under Verification",
    currentStage: "Hierarchy Verification",
    submittedAt: "2026-08-28T16:45:00",
    updatedAt: "2026-09-10T10:00:00",
    classification: {
      projectType: "Railway",
      authorityLevels: [
        { level: 1, name: "Project Initiating Authority", officer: "V. Kumar", designation: "Chief Engineer (Construction)", status: "Approved", remarks: "Alignment approved", actionAt: "2026-08-30T10:00:00" },
        { level: 2, name: "District-level Authority", officer: "P. Yadav", designation: "District Collector, Rewari", status: "Pending", remarks: "", actionAt: null },
        { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Transport", status: "Pending", remarks: "", actionAt: null },
        { level: 4, name: "Final Authority", officer: "", designation: "Chairman, Railway Board", status: "Pending", remarks: "", actionAt: null },
      ],
    },
    workflowHistory: [
      { stage: "Registration", status: "Completed", at: "2026-08-28T16:45:00", by: "System", remarks: "Proposal registered" },
      { stage: "Classification", status: "Completed", at: "2026-08-29T11:00:00", by: "V. Kumar", remarks: "Classified as Railway project" },
      { stage: "Hierarchy Verification", status: "In Progress", at: "2026-09-10T10:00:00", by: "P. Yadav", remarks: "Under district-level review" },
    ],
  },
  {
    id: "LAD-PROP-2026-0003",
    projectName: "Greenfield Industrial Township - Greater Noida Phase 2",
    description: "Development of integrated industrial township with plug-and-play infrastructure for electronics manufacturing.",
    projectType: "Industrial Project",
    department: "Department for Promotion of Industry and Internal Trade",
    state: "Uttar Pradesh",
    district: "Gautam Buddha Nagar",
    tehsil: "Dadri",
    village: "Kherli Hafizpur",
    estimatedCost: 3200000000,
    estimatedLandRequirement: 350.0,
    unit: "hectare",
    expectedStartDate: "2027-01-15",
    expectedCompletionDate: "2030-06-30",
    purposeOfAcquisition: "Industrial plots, common infrastructure, residential township, and green belt",
    requiredArea: 350.0,
    expectedParcels: 412,
    landType: "Mixed",
    locations: [
      {
        id: "loc-1",
        name: "Main Township Area",
        latitude: 28.4744,
        longitude: 77.5040,
      },
      {
        id: "loc-2",
        name: "Residential Zone",
        latitude: 28.4650,
        longitude: 77.5120,
      },
    ],
    submissionMode: "Government API",
    portalReferenceId: "",
    apiTransactionId: "DPIIT-API-2026-001234",
    documents: [
      { id: "doc-1", type: "Project Proposal", name: "GNIDA_Phase2_Proposal.pdf", uploadedAt: "2026-09-01T09:00:00" },
      { id: "doc-2", type: "DPR", name: "GNIDA_Phase2_DPR.pdf", uploadedAt: "2026-09-01T09:15:00" },
      { id: "doc-3", type: "Administrative Approval", name: "Admin_Approval_GNIDA_Ph2.pdf", uploadedAt: "2026-09-02T11:30:00" },
    ],
    status: "Submitted",
    currentStage: "Registration",
    submittedAt: "2026-09-03T14:20:00",
    updatedAt: "2026-09-03T14:20:00",
    classification: {
      projectType: "Industrial Project",
      authorityLevels: [
        { level: 1, name: "Project Initiating Authority", officer: "", designation: "CEO, GNIDA", status: "Pending", remarks: "", actionAt: null },
        { level: 2, name: "District-level Authority", officer: "", designation: "District Magistrate, GB Nagar", status: "Pending", remarks: "", actionAt: null },
        { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Industrial Development", status: "Pending", remarks: "", actionAt: null },
        { level: 4, name: "Final Authority", officer: "", designation: "Secretary, DPIIT", status: "Pending", remarks: "", actionAt: null },
      ],
    },
    workflowHistory: [
      { stage: "Registration", status: "In Progress", at: "2026-09-03T14:20:00", by: "System", remarks: "Proposal submitted, awaiting registration review" },
    ],
  },
  {
    id: "LAD-PROP-2026-0004",
    projectName: "Ken-Betwa River Link Project (Phase 1 - Dam Component)",
    description: "Inter-basin water transfer project linking Ken and Betwa rivers. Phase 1 includes Daudhan Dam and canal system.",
    projectType: "Irrigation",
    department: "Ministry of Jal Shakti",
    state: "Madhya Pradesh",
    district: "Panna",
    tehsil: "Gunnor",
    village: "Daudhan",
    estimatedCost: 4500000000,
    estimatedLandRequirement: 520.7,
    unit: "hectare",
    expectedStartDate: "2027-02-01",
    expectedCompletionDate: "2031-12-31",
    purposeOfAcquisition: "Dam reservoir submergence area, canal alignment, and colony rehabilitation",
    requiredArea: 520.7,
    expectedParcels: 678,
    landType: "Mixed",
    locations: [
      {
        id: "loc-1",
        name: "Daudhan Dam Site",
        latitude: 24.8765,
        longitude: 80.1234,
      },
      {
        id: "loc-2",
        name: "Canal Headworks",
        latitude: 24.9012,
        longitude: 80.1567,
      },
    ],
    submissionMode: "Manual Submission",
    portalReferenceId: "",
    apiTransactionId: "",
    documents: [
      { id: "doc-1", type: "Project Proposal", name: "Ken_Betwa_Phase1_Proposal.pdf", uploadedAt: "2026-07-15T10:00:00" },
      { id: "doc-2", type: "DPR", name: "Ken_Betwa_DPR_Vol1.pdf", uploadedAt: "2026-07-15T10:30:00" },
      { id: "doc-3", type: "Preliminary Survey", name: "Survey_Report_Daudhan.pdf", uploadedAt: "2026-07-20T16:00:00" },
      { id: "doc-4", type: "Environmental Clearance", name: "EC_Ken_Betwa.pdf", uploadedAt: "2026-08-01T12:00:00" },
    ],
    status: "Sent Back",
    currentStage: "Officer Verification",
    submittedAt: "2026-07-25T11:00:00",
    updatedAt: "2026-09-05T14:30:00",
    classification: {
      projectType: "Irrigation",
      authorityLevels: [
        { level: 1, name: "Project Initiating Authority", officer: "S. Patel", designation: "Chief Engineer, WRD", status: "Approved", remarks: "Technical feasibility confirmed", actionAt: "2026-07-28T10:00:00" },
        { level: 2, name: "District-level Authority", officer: "R. Tiwari", designation: "Collector, Panna", status: "Approved", remarks: "Land records verified", actionAt: "2026-08-10T14:00:00" },
        { level: 3, name: "State-level Authority", officer: "A. Jain", designation: "Principal Secretary, Water Resources", status: "Sent Back", remarks: "Environmental clearance conditions need clarification", actionAt: "2026-09-05T14:30:00" },
        { level: 4, name: "Final Authority", officer: "", designation: "Secretary, MoJS", status: "Pending", remarks: "", actionAt: null },
      ],
    },
    workflowHistory: [
      { stage: "Registration", status: "Completed", at: "2026-07-25T11:00:00", by: "System", remarks: "Proposal registered" },
      { stage: "Classification", status: "Completed", at: "2026-07-26T09:00:00", by: "S. Patel", remarks: "Classified as Irrigation project" },
      { stage: "Hierarchy Verification", status: "Completed", at: "2026-08-10T14:00:00", by: "R. Tiwari", remarks: "District verification complete" },
      { stage: "Officer Verification", status: "Sent Back", at: "2026-09-05T14:30:00", by: "A. Jain", remarks: "Environmental clearance conditions need clarification. Please provide compliance report for EC conditions 4.2 and 4.5." },
      { stage: "Final Approval", status: "Pending", at: null, by: null, remarks: "" },
    ],
  },
  {
    id: "LAD-PROP-2026-0005",
    projectName: "765 kV Transmission Line - Bhadla to Fatehgarh",
    description: "High-voltage transmission line for evacuation of solar power from Bhadla Solar Park.",
    projectType: "Power Infrastructure",
    department: "Ministry of Power",
    state: "Rajasthan",
    district: "Jaisalmer",
    tehsil: "Fatehgarh",
    village: "Bhadla",
    estimatedCost: 850000000,
    estimatedLandRequirement: 45.2,
    unit: "hectare",
    expectedStartDate: "2026-10-01",
    expectedCompletionDate: "2027-09-30",
    purposeOfAcquisition: "Tower footings, right of way corridor, and substation land",
    requiredArea: 45.2,
    expectedParcels: 89,
    landType: "Government",
    locations: [
      {
        id: "loc-1",
        name: "Bhadla Substation",
        latitude: 27.5342,
        longitude: 71.9234,
      },
      {
        id: "loc-2",
        name: "Fatehgarh Substation",
        latitude: 27.7890,
        longitude: 72.1567,
      },
    ],
    submissionMode: "Manual Submission",
    portalReferenceId: "",
    apiTransactionId: "",
    documents: [
      { id: "doc-1", type: "Project Proposal", name: "PGCIL_Bhadla_Fatehgarh_Proposal.pdf", uploadedAt: "2026-09-10T11:00:00" },
      { id: "doc-2", type: "Land Requirement Statement", name: "Land_Req_Transmission_Line.pdf", uploadedAt: "2026-09-10T11:15:00" },
    ],
    status: "Draft",
    currentStage: "Registration",
    submittedAt: null,
    updatedAt: "2026-09-10T11:30:00",
    classification: {
      projectType: "Power Infrastructure",
      authorityLevels: [
        { level: 1, name: "Project Initiating Authority", officer: "", designation: "ED, PGCIL", status: "Pending", remarks: "", actionAt: null },
        { level: 2, name: "District-level Authority", officer: "", designation: "Collector, Jaisalmer", status: "Pending", remarks: "", actionAt: null },
        { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Energy", status: "Pending", remarks: "", actionAt: null },
        { level: 4, name: "Final Authority", officer: "", designation: "Secretary, Ministry of Power", status: "Pending", remarks: "", actionAt: null },
      ],
    },
    workflowHistory: [
      { stage: "Registration", status: "Draft", at: "2026-09-10T11:30:00", by: "System", remarks: "Draft saved" },
    ],
  },
  {
    id: "LAD-PROP-2026-0006",
    projectName: "Chennai Metro Rail Phase 2 - Corridor 4",
    description: "Extension of Chennai Metro from Poonamallee to Parandur Airport via Sriperumbudur.",
    projectType: "Railway",
    department: "Chennai Metro Rail Limited",
    state: "Tamil Nadu",
    district: "Kanchipuram",
    tehsil: "Sriperumbudur",
    village: "Vadagal",
    estimatedCost: 12500000000,
    estimatedLandRequirement: 89.4,
    unit: "hectare",
    expectedStartDate: "2027-04-01",
    expectedCompletionDate: "2030-12-31",
    purposeOfAcquisition: "Metro alignment, stations, depot, and transit-oriented development",
    requiredArea: 89.4,
    expectedParcels: 156,
    landType: "Mixed",
    locations: [
      {
        id: "loc-1",
        name: "Depot Site - Vadagal",
        latitude: 12.9678,
        longitude: 79.9456,
      },
      {
        id: "loc-2",
        name: "Station - Sriperumbudur",
        latitude: 12.9589,
        longitude: 79.9345,
      },
    ],
    submissionMode: "Existing Portal",
    portalReferenceId: "CMRL-PH2-C4-2026-0078",
    apiTransactionId: "",
    documents: [
      { id: "doc-1", type: "Project Proposal", name: "CMRL_Ph2_Corridor4_Proposal.pdf", uploadedAt: "2026-08-05T09:00:00" },
      { id: "doc-2", type: "DPR", name: "CMRL_Ph2_C4_DPR.pdf", uploadedAt: "2026-08-05T09:30:00" },
      { id: "doc-3", type: "Land Requirement Statement", name: "CMRL_Land_Req_C4.pdf", uploadedAt: "2026-08-06T14:00:00" },
      { id: "doc-4", type: "Administrative Approval", name: "Govt_Approval_CMRL_Ph2.pdf", uploadedAt: "2026-08-10T11:00:00" },
    ],
    status: "Rejected",
    currentStage: "Hierarchy Verification",
    submittedAt: "2026-08-12T16:00:00",
    updatedAt: "2026-08-25T10:30:00",
    classification: {
      projectType: "Railway",
      authorityLevels: [
        { level: 1, name: "Project Initiating Authority", officer: "K. Rajan", designation: "Director Projects, CMRL", status: "Approved", remarks: "Alignment finalized", actionAt: "2026-08-15T10:00:00" },
        { level: 2, name: "District-level Authority", officer: "M. Iyer", designation: "Collector, Kanchipuram", status: "Rejected", remarks: "Significant overlap with SIPCOT industrial land allocation. Alternative alignment required.", actionAt: "2026-08-25T10:30:00" },
        { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Housing & Urban Development", status: "Pending", remarks: "", actionAt: null },
        { level: 4, name: "Final Authority", officer: "", designation: "Secretary, MoHUA", status: "Pending", remarks: "", actionAt: null },
      ],
    },
    workflowHistory: [
      { stage: "Registration", status: "Completed", at: "2026-08-12T16:00:00", by: "System", remarks: "Proposal registered" },
      { stage: "Classification", status: "Completed", at: "2026-08-13T10:00:00", by: "K. Rajan", remarks: "Classified as Urban Railway project" },
      { stage: "Hierarchy Verification", status: "Rejected", at: "2026-08-25T10:30:00", by: "M. Iyer", remarks: "Significant overlap with SIPCOT industrial land allocation. Alternative alignment required." },
    ],
  },
];

export function getProposalById(id) {
  if (!id) return null;
  return allProposals.find((proposal) => proposal.id === id) || null;
}

export function getProposalsByStatus(status) {
  if (!status || status === "All") return allProposals;
  return allProposals.filter((p) => p.status === status);
}

export function getProposalsByProjectType(projectType) {
  if (!projectType || projectType === "All") return allProposals;
  return allProposals.filter((p) => p.projectType === projectType);
}

export function getProposalsByState(state) {
  if (!state || state === "All") return allProposals;
  return allProposals.filter((p) => p.state === state);
}

export function uniqueStates() {
  return [...new Set(allProposals.map((p) => p.state))].sort();
}

export function uniqueProjectTypes() {
  return [...new Set(allProposals.map((p) => p.projectType))].sort();
}

export function uniqueStages() {
  return [...new Set(allProposals.map((p) => p.currentStage))].sort();
}

export function filterProposals({ search = "", status = "All", projectType = "All", state = "All", sortBy = "submitted-desc" } = {}) {
  const q = search.trim().toLowerCase();
  let list = allProposals.filter((p) => {
    if (status !== "All" && p.status !== status) return false;
    if (projectType !== "All" && p.projectType !== projectType) return false;
    if (state !== "All" && p.state !== state) return false;
    if (
      q &&
      ![p.projectName, p.id, p.state, p.district, p.department]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });

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

  return list;
}

// Classification helper functions
export function getSuggestedCategory(projectType) {
  return PROJECT_TYPE_TO_CATEGORY[projectType] || "Other";
}

export function getSuggestedLandAcquisitionType(landType) {
  const mapping = {
    "Government": "Government Land",
    "Private": "Private Land",
    "Mixed": "Mixed Land",
  };
  return mapping[landType] || "Mixed Land";
}

export function calculateProjectScale(proposal) {
  const cost = Number(proposal.estimatedCost) || 0;
  const land = Number(proposal.estimatedLandRequirement) || 0;
  const parcels = Number(proposal.expectedParcels) || 0;

  // Thresholds are configurable/prototype
  if (cost >= 5000000000 || land >= 500 || parcels >= 500) return "Major";
  if (cost >= 2000000000 || land >= 200 || parcels >= 200) return "Large";
  if (cost >= 500000000 || land >= 50 || parcels >= 50) return "Medium";
  return "Small";
}

export function calculateAcquisitionComplexity(proposal) {
  const land = Number(proposal.estimatedLandRequirement) || 0;
  const parcels = Number(proposal.expectedParcels) || 0;
  const landType = proposal.landType;

  let complexityScore = 0;

  // Land area factor
  if (land >= 500) complexityScore += 3;
  else if (land >= 200) complexityScore += 2;
  else if (land >= 50) complexityScore += 1;

  // Parcel count factor
  if (parcels >= 500) complexityScore += 3;
  else if (parcels >= 200) complexityScore += 2;
  else if (parcels >= 50) complexityScore += 1;

  // Land type factor
  if (landType === "Private") complexityScore += 2;
  else if (landType === "Mixed") complexityScore += 1;

  if (complexityScore >= 6) return "Critical";
  if (complexityScore >= 4) return "High";
  if (complexityScore >= 2) return "Medium";
  return "Low";
}

export function generateAutoClassification(proposal) {
  return {
    category: getSuggestedCategory(proposal.projectType),
    projectType: proposal.projectType,
    landAcquisitionType: getSuggestedLandAcquisitionType(proposal.landType),
    projectScale: calculateProjectScale(proposal),
    acquisitionComplexity: calculateAcquisitionComplexity(proposal),
    status: "Classified",
    remarks: "Auto-classified based on proposal data",
    classifiedBy: "System (Auto)",
    classifiedAt: new Date().toISOString(),
    isAutoClassified: true,
  };
}

export function generateAuthorityLevels(category, projectType) {
  // Configurable prototype authority levels based on category
  const baseLevels = [
    { level: 1, name: "Project Initiating Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    { level: 2, name: "District-level Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    { level: 3, name: "State-level Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    { level: 4, name: "Final Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
  ];

  // Category-specific customizations (prototype)
  const categoryCustomizations = {
    "Transport Infrastructure": [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "Chief Engineer (NH)", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "District Collector", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, PWD", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 4, name: "Final Authority", officer: "", designation: "Secretary, MoRTH", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    ],
    "Rail Infrastructure": [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "Chief Engineer (Construction)", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "District Collector", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Transport", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 4, name: "Final Authority", officer: "", designation: "Chairman, Railway Board", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    ],
    "Irrigation & Water Resources": [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "Chief Engineer, WRD", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "District Collector", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Water Resources", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 4, name: "Final Authority", officer: "", designation: "Secretary, MoJS", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    ],
    "Power & Energy": [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "ED, PGCIL", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "District Collector", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Energy", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 4, name: "Final Authority", officer: "", designation: "Secretary, Ministry of Power", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    ],
    "Industrial Development": [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "CEO, Industrial Authority", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "District Magistrate", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Industries", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 4, name: "Final Authority", officer: "", designation: "Secretary, DPIIT", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    ],
    "Urban Development": [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "Director Projects", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "District Collector", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Urban Development", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 4, name: "Final Authority", officer: "", designation: "Secretary, MoHUA", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    ],
    "Defence Infrastructure": [
      { level: 1, name: "Project Initiating Authority", officer: "", designation: "Chief Engineer, Defence Works", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 2, name: "District-level Authority", officer: "", designation: "District Collector", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 3, name: "State-level Authority", officer: "", designation: "Principal Secretary, Defence", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
      { level: 4, name: "Final Authority", officer: "", designation: "Secretary, MoD", status: "Pending", remarks: "", actionAt: null, assignedDate: null },
    ],
  };

  return categoryCustomizations[category] || baseLevels;
}