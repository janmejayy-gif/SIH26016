import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown, Plus, CheckCircle, X, XCircle, Clock, AlertCircle, MapPin, Edit, Save, RefreshCw } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { getProposals, submitProposal, createProposal, updateProposalClassification, updateProposalHierarchy, approveAuthorityLevel, rejectAuthorityLevel, sendBackAuthorityLevel, resubmitProposal } from "../services/api.js";
import {
  allProposals,
  PROPOSAL_STATUSES,
  PROPOSAL_STAGES,
  PROJECT_TYPES,
  UNITS,
  LAND_TYPES,
  SUBMISSION_MODES,
  DOCUMENT_TYPES,
  uniqueStates,
  uniqueProjectTypes,
  filterProposals,
  generateProposalId,
  CLASSIFICATION_STATUSES,
  HIERARCHY_AUTHORITY_STATUSES,
  PROJECT_CATEGORIES,
  LAND_ACQUISITION_TYPES,
  PROJECT_SCALES,
  ACQUISITION_COMPLEXITIES,
  PROJECT_TYPE_TO_CATEGORY,
  getSuggestedCategory,
  getSuggestedLandAcquisitionType,
  calculateProjectScale,
  calculateAcquisitionComplexity,
  generateAutoClassification,
  generateAuthorityLevels,
} from "../data/proposals.js";
import { formatTimestamp } from "../utils/projectUtils.js";

const STATUS_OPTIONS = ["All", ...PROPOSAL_STATUSES];
const STAGE_OPTIONS = ["All", ...PROPOSAL_STAGES];
const PROJECT_TYPE_OPTIONS = ["All", ...PROJECT_TYPES];
const STATE_OPTIONS = ["All States", ...uniqueStates()];

const SORT_OPTIONS = [
  { value: "submitted-desc", label: "Submitted · Newest first" },
  { value: "submitted-asc", label: "Submitted · Oldest first" },
  { value: "name-asc", label: "Project Name · A-Z" },
  { value: "name-desc", label: "Project Name · Z-A" },
  { value: "status-asc", label: "Status · A-Z" },
  { value: "status-desc", label: "Status · Z-A" },
  { value: "stage-asc", label: "Stage · A-Z" },
  { value: "stage-desc", label: "Stage · Z-A" },
];

const STATUS_COLORS = {
  Draft: { bg: "var(--amber-soft)", border: "var(--amber-border)", text: "var(--amber)" },
  Submitted: { bg: "var(--primary-soft)", border: "var(--primary-border)", text: "var(--primary)" },
  "Under Verification": { bg: "var(--orange-soft)", border: "var(--orange-border)", text: "var(--orange)" },
  "Sent Back": { bg: "var(--red-soft)", border: "var(--red-border)", text: "var(--red)" },
  Rejected: { bg: "var(--red-soft)", border: "var(--red-border)", text: "var(--red)" },
  Approved: { bg: "var(--green-soft)", border: "var(--green-border)", text: "var(--green)" },
};

const STAGE_COLORS = {
  Registration: { bg: "var(--primary-soft)", border: "var(--primary-border)", text: "var(--primary)" },
  Classification: { bg: "var(--amber-soft)", border: "var(--amber-border)", text: "var(--amber)" },
  "Hierarchy Verification": { bg: "var(--orange-soft)", border: "var(--orange-border)", text: "var(--orange)" },
  "Officer Verification": { bg: "var(--orange-soft)", border: "var(--orange-border)", text: "var(--orange)" },
  "Final Approval": { bg: "var(--green-soft)", border: "var(--green-border)", text: "var(--green)" },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.Draft;
  return (
    <span
      className="status-badge"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {status}
    </span>
  );
}

function StageBadge({ stage }) {
  const colors = STAGE_COLORS[stage] || STAGE_COLORS.Registration;
  return (
    <span
      className="stage-badge"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {stage}
    </span>
  );
}

export default function Proposals() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiProposals, setApiProposals] = useState(null);
  const [source, setSource] = useState("local");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectTypeFilter, setProjectTypeFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All States");
  const [sortBy, setSortBy] = useState("submitted-desc");
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showClassification, setShowClassification] = useState(false);
  const [classificationProposal, setClassificationProposal] = useState(null);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [hierarchyProposal, setHierarchyProposal] = useState(null);

  useEffect(() => {
    document.title = "Project Proposals · LADI Portal";
  }, []);

  // Pre-filter when arriving via query params
  useEffect(() => {
    const status = searchParams.get("status");
    const projectType = searchParams.get("projectType");
    const state = searchParams.get("state");
    if (status && PROPOSAL_STATUSES.includes(status)) setStatusFilter(status);
    if (projectType && PROJECT_TYPES.includes(projectType)) setProjectTypeFilter(projectType);
    if (state && uniqueStates().includes(state)) setStateFilter(state);
  }, [searchParams]);

  // Try the backend first; fall back to bundled mock data if unavailable.
  useEffect(() => {
    let active = true;
    getProposals()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setApiProposals(data);
          setSource("api");
        }
      })
      .catch(() => {
        if (active) setSource("local");
      });
    return () => {
      active = false;
    };
  }, []);

  const dataset = apiProposals && apiProposals.length > 0 ? apiProposals : allProposals;

  const filtered = useMemo(() => {
    return filterProposals({
      search,
      status: statusFilter,
      projectType: projectTypeFilter,
      state: stateFilter,
      sortBy,
    });
  }, [dataset, search, statusFilter, projectTypeFilter, stateFilter, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setProjectTypeFilter("All");
    setStateFilter("All States");
    setSortBy("submitted-desc");
  };

  const handleNewProposal = () => {
    setShowNewProposal(true);
  };

  const handleViewProposal = (id) => {
    const proposal = dataset.find((p) => p.id === id);
    if (proposal) {
      setSelectedProposal(proposal);
    }
  };

  const handleCloseDetail = () => {
    setSelectedProposal(null);
  };

  const handleOpenClassification = (proposal) => {
    setClassificationProposal(proposal);
    setShowClassification(true);
  };

  const handleClassificationSaved = async (updatedClassification) => {
    setShowClassification(false);
    setClassificationProposal(null);
    // Refresh the proposal data
    if (source === "api") {
      try {
        const data = await getProposals();
        setApiProposals(data);
      } catch (err) {
        console.warn("Failed to refresh proposals:", err);
      }
    }
    // Update the selected proposal if it's the same one
    if (selectedProposal && selectedProposal.id === updatedClassification.id) {
      setSelectedProposal({ ...selectedProposal, ...updatedClassification });
    }
  };

  const handleOpenHierarchy = (proposal) => {
    setHierarchyProposal(proposal);
    setShowHierarchy(true);
  };

  const handleHierarchySaved = async (updatedProposal) => {
    setShowHierarchy(false);
    setHierarchyProposal(null);
    // Refresh the proposal data
    if (source === "api") {
      try {
        const data = await getProposals();
        setApiProposals(data);
      } catch (err) {
        console.warn("Failed to refresh proposals:", err);
      }
    }
    // Update the selected proposal if it's the same one
    if (selectedProposal && selectedProposal.id === updatedProposal.id) {
      setSelectedProposal({ ...selectedProposal, ...updatedProposal });
    }
  };

  const handleProposalCreated = async (newProposal) => {
    setShowNewProposal(false);
    if (source === "api") {
      // Refresh from API
      try {
        const data = await getProposals();
        setApiProposals(data);
      } catch (err) {
        console.warn("Failed to refresh proposals:", err);
      }
    }
    // Navigate to detail view
    navigate(`/proposals/${newProposal.id}`);
  };

  return (
    <>
      <PageHeader
        title="Project Proposals"
        subtitle="Register and manage land acquisition project proposals before approval."
      >
        <div className="header-side">
          <button className="btn btn-primary" onClick={handleNewProposal}>
            <Plus size={15} aria-hidden="true" />
            New Proposal
          </button>
        </div>
      </PageHeader>

      <SectionHeader
        title={`Proposals · ${filtered.length} of ${dataset.length}`}
        subtitle={source === "api" ? "Live from LADI Backend" : "Local demonstration data (backend unavailable)"}
      />

      <div className="filter-row">
        <label className="filter-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="text"
            className="text-input"
            placeholder="Name, ID, district, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search proposals"
          />
        </label>
        <select
          className="select-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter proposals by status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="select-input"
          value={projectTypeFilter}
          onChange={(e) => setProjectTypeFilter(e.target.value)}
          aria-label="Filter proposals by project type"
        >
          {PROJECT_TYPE_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="select-input"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          aria-label="Filter proposals by state"
        >
          {STATE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="select-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort proposals"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(search || statusFilter !== "All" || projectTypeFilter !== "All" || stateFilter !== "All States") && (
          <button className="btn btn-outline" onClick={resetFilters}>
            Reset filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="card table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Proposal ID</th>
                <th>Project Name</th>
                <th>Department</th>
                <th>Project Type</th>
                <th>State</th>
                <th>District</th>
                <th>Land Req. ({filtered[0]?.unit || "hectare"})</th>
                <th>Submission Mode</th>
                <th>Current Stage</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proposal) => (
                <tr key={proposal.id} className="row-clickable" onClick={() => handleViewProposal(proposal.id)}>
                  <td>
                    <span className="proj-id">{proposal.id}</span>
                  </td>
                  <td className="proj-name" title={proposal.projectName}>
                    {proposal.projectName}
                  </td>
                  <td>{proposal.department}</td>
                  <td>{proposal.projectType}</td>
                  <td>{proposal.state}</td>
                  <td>{proposal.district}</td>
                  <td className="delay-cell">{proposal.estimatedLandRequirement}</td>
                  <td>{proposal.submissionMode}</td>
                  <td><StageBadge stage={proposal.currentStage} /></td>
                  <td><StatusBadge status={proposal.status} /></td>
                  <td>{proposal.submittedAt ? formatTimestamp(proposal.submittedAt) : "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="action-link"
                      onClick={(e) => { e.stopPropagation(); handleViewProposal(proposal.id); }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card placeholder-panel">
          <h3>No matching proposals found.</h3>
          <p>Adjust or reset the search and filters to view registered proposals.</p>
          <button className="btn btn-primary" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      )}

      {/* New Proposal Modal/Drawer */}
      {showNewProposal && (
        <ProposalFormDrawer onClose={() => setShowNewProposal(false)} onSubmit={handleProposalCreated} />
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <ProposalDetailModal proposal={selectedProposal} onClose={handleCloseDetail} onOpenClassification={handleOpenClassification} onOpenHierarchy={handleOpenHierarchy} />
      )}

      {/* Classification Modal */}
      {showClassification && classificationProposal && (
        <ClassificationModal proposal={classificationProposal} onClose={() => { setShowClassification(false); setClassificationProposal(null); }} onSave={handleClassificationSaved} />
      )}

      {/* Hierarchy Modal */}
      {showHierarchy && hierarchyProposal && (
        <HierarchyModal proposal={hierarchyProposal} onClose={() => { setShowHierarchy(false); setHierarchyProposal(null); }} onSave={handleHierarchySaved} />
      )}
    </>
  );
}

// Proposal Form Drawer Component
function ProposalFormDrawer({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Project Information
    projectName: "",
    description: "",
    projectType: "",
    department: "",
    state: "",
    district: "",
    tehsil: "",
    village: "",
    estimatedCost: "",
    estimatedLandRequirement: "",
    unit: "hectare",
    expectedStartDate: "",
    expectedCompletionDate: "",
    // Step 2: Land Requirement
    purposeOfAcquisition: "",
    requiredArea: "",
    expectedParcels: "",
    landType: "",
    locations: [{ id: "loc-1", name: "", latitude: "", longitude: "" }],
    // Step 3: Submission Details
    submissionMode: "Manual Submission",
    portalReferenceId: "",
    apiTransactionId: "",
    // Step 4: Documents
    documents: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateStep = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      if (!formData.projectName.trim()) newErrors.projectName = "Project name is required";
      if (!formData.projectType) newErrors.projectType = "Project type is required";
      if (!formData.department.trim()) newErrors.department = "Department is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.district.trim()) newErrors.district = "District is required";
      if (!formData.tehsil.trim()) newErrors.tehsil = "Tehsil is required";
      if (!formData.village.trim()) newErrors.village = "Village is required";
      if (!formData.estimatedCost || Number(formData.estimatedCost) <= 0) newErrors.estimatedCost = "Valid estimated cost is required";
      if (!formData.estimatedLandRequirement || Number(formData.estimatedLandRequirement) <= 0) newErrors.estimatedLandRequirement = "Valid land requirement is required";
      if (!formData.expectedStartDate) newErrors.expectedStartDate = "Expected start date is required";
      if (!formData.expectedCompletionDate) newErrors.expectedCompletionDate = "Expected completion date is required";
      if (formData.expectedStartDate && formData.expectedCompletionDate && new Date(formData.expectedStartDate) >= new Date(formData.expectedCompletionDate)) {
        newErrors.expectedCompletionDate = "Completion date must be after start date";
      }
    } else if (stepNum === 2) {
      if (!formData.purposeOfAcquisition.trim()) newErrors.purposeOfAcquisition = "Purpose of acquisition is required";
      if (!formData.requiredArea || Number(formData.requiredArea) <= 0) newErrors.requiredArea = "Required area is required";
      if (!formData.expectedParcels || Number(formData.expectedParcels) <= 0) newErrors.expectedParcels = "Expected parcels is required";
      if (!formData.landType) newErrors.landType = "Land type is required";
      formData.locations.forEach((loc, idx) => {
        if (!loc.name.trim()) newErrors[`locationName-${idx}`] = "Location name is required";
        if (loc.latitude === "" || isNaN(Number(loc.latitude)) || Number(loc.latitude) < -90 || Number(loc.latitude) > 90) {
          newErrors[`latitude-${idx}`] = "Valid latitude (-90 to 90) is required";
        }
        if (loc.longitude === "" || isNaN(Number(loc.longitude)) || Number(loc.longitude) < -180 || Number(loc.longitude) > 180) {
          newErrors[`longitude-${idx}`] = "Valid longitude (-180 to 180) is required";
        }
      });
    } else if (stepNum === 3) {
      if (formData.submissionMode === "Existing Portal" && !formData.portalReferenceId.trim()) {
        newErrors.portalReferenceId = "Portal reference ID is required";
      }
      if (formData.submissionMode === "Government API" && !formData.apiTransactionId.trim()) {
        newErrors.apiTransactionId = "API transaction ID is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleNestedChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated[section] = [...prev[section]];
      updated[section][index] = { ...updated[section][index], [field]: value };
      return updated;
    });
    if (errors[`${field}-${index}`]) setErrors((prev) => ({ ...prev, [`${field}-${index}`]: null }));
  };

  const addLocation = () => {
    setFormData((prev) => ({
      ...prev,
      locations: [...prev.locations, { id: `loc-${Date.now()}`, name: "", latitude: "", longitude: "" }],
    }));
  };

  const removeLocation = (id) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc.id !== id),
    }));
  };

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, { id: `doc-${Date.now()}`, type: "", name: "", uploadedAt: new Date().toISOString() }],
    }));
  };

  const removeDocument = (id) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    }));
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (saveDraft = false) => {
    if (!validateStep(step)) return;
    if (!saveDraft && step < 5) {
      setStep(5);
      return;
    }

    setSubmitting(true);
    try {
      const proposalData = {
        ...formData,
        estimatedCost: Number(formData.estimatedCost),
        estimatedLandRequirement: Number(formData.estimatedLandRequirement),
        requiredArea: Number(formData.requiredArea),
        expectedParcels: Number(formData.expectedParcels),
        locations: formData.locations.map((loc) => ({
          ...loc,
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
        })),
        status: saveDraft ? "Draft" : "Submitted",
        currentStage: saveDraft ? "Registration" : "Registration",
        submittedAt: saveDraft ? null : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        classification: {
          projectType: formData.projectType,
          authorityLevels: [
            { level: 1, name: "Project Initiating Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
            { level: 2, name: "District-level Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
            { level: 3, name: "State-level Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
            { level: 4, name: "Final Authority", officer: "", designation: "", status: "Pending", remarks: "", actionAt: null },
          ],
        },
        workflowHistory: [
          { stage: "Registration", status: saveDraft ? "Draft" : "In Progress", at: new Date().toISOString(), by: "System", remarks: saveDraft ? "Draft saved" : "Proposal submitted for registration" },
        ],
      };

      const newProposal = await createProposal(proposalData);
      if (!saveDraft) {
        await submitProposal(newProposal.id);
      }
      onSubmit(newProposal);
    } catch (err) {
      console.error("Failed to create proposal:", err);
      alert("Failed to create proposal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Project Information" },
    { num: 2, title: "Land Requirement" },
    { num: 3, title: "Submission Details" },
    { num: 4, title: "Documents" },
    { num: 5, title: "Review & Submit" },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-label="New Proposal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px", width: "95vw", maxHeight: "90vh" }}
      >
        <div className="modal-head">
          <div>
            <h2 className="modal-title">New Project Proposal</h2>
            <div className="modal-subrow">
              <span className="category-chip">Step {step} of 5</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0, maxHeight: "65vh", overflow: "auto" }}>
          {/* Stepper */}
          <div className="stepper" style={{ display: "flex", padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
            {steps.map((s, idx) => (
              <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div
                  className={`stepper-step ${idx + 1 < step ? "completed" : idx + 1 === step ? "active" : ""}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    background: idx + 1 < step ? "var(--green)" : idx + 1 === step ? "var(--primary)" : "var(--border)",
                    color: idx + 1 < step ? "#fff" : idx + 1 === step ? "#fff" : "var(--muted)",
                    border: "2px solid",
                    borderColor: idx + 1 < step ? "var(--green)" : idx + 1 === step ? "var(--primary)" : "var(--border)",
                    zIndex: 2,
                  }}
                >
                  {idx + 1 < step ? <CheckCircle size={16} /> : s.num}
                </div>
                <span
                  className="stepper-label"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: idx + 1 <= step ? "var(--navy)" : "var(--muted)",
                    marginLeft: 8,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.title}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: idx + 1 < step ? "var(--green)" : "var(--border)",
                      marginLeft: -16,
                      zIndex: 1,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div style={{ padding: "24px" }}>
            {step === 1 && <ProjectInfoStep formData={formData} errors={errors} onChange={handleChange} />}
            {step === 2 && <LandRequirementStep formData={formData} errors={errors} onChange={handleNestedChange} onAddLocation={addLocation} onRemoveLocation={removeLocation} />}
            {step === 3 && <SubmissionDetailsStep formData={formData} errors={errors} onChange={handleChange} />}
            {step === 4 && <DocumentsStep formData={formData} onAddDocument={addDocument} onRemoveDocument={removeDocument} />}
            {step === 5 && <ReviewSubmitStep formData={formData} />}
          </div>
        </div>

        <div className="modal-foot" style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {step > 1 && (
              <button className="btn btn-outline" onClick={handlePrevious} disabled={submitting}>
                Previous
              </button>
            )}
            {step === 1 && (
              <button className="btn btn-outline" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            {step < 5 && (
              <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                Next
              </button>
            )}
            {step === 5 && (
              <>
                <button className="btn btn-outline" onClick={() => handleSubmit(true)} disabled={submitting}>
                  Save Draft
                </button>
                <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Proposal"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Project Information
function ProjectInfoStep({ formData, errors, onChange }) {
  const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ];

  return (
    <div className="form-grid" style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))", 
      gap: "16px 24px",
      padding: "8px 4px"
    }}>
      {/* LEFT COLUMN */}
      <FormField label="Project Name *" error={errors.projectName}>
        <input type="text" className="text-input" value={formData.projectName} onChange={(e) => onChange("projectName", e.target.value)} placeholder="e.g., Delhi–Mumbai Expressway (Package 7)" />
      </FormField>

      <FormField label="Project Type *" error={errors.projectType}>
        <select className="select-input" value={formData.projectType} onChange={(e) => onChange("projectType", e.target.value)}>
          <option value="">Select project type</option>
          {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </FormField>

      <FormField label="State *" error={errors.state}>
        <select className="select-input" value={formData.state} onChange={(e) => onChange("state", e.target.value)}>
          <option value="">Select state</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </FormField>

      <FormField label="Tehsil *" error={errors.tehsil}>
        <input type="text" className="text-input" value={formData.tehsil} onChange={(e) => onChange("tehsil", e.target.value)} placeholder="e.g., Ladpura" />
      </FormField>

      <FormField label="Estimated Project Cost (₹) *" error={errors.estimatedCost}>
        <input type="number" className="text-input" value={formData.estimatedCost} onChange={(e) => onChange("estimatedCost", e.target.value)} placeholder="e.g., 2450000000" step="100000" min="0" />
      </FormField>

      <FormField label="Expected Project Start Date *" error={errors.expectedStartDate}>
        <input type="date" className="text-input" value={formData.expectedStartDate} onChange={(e) => onChange("expectedStartDate", e.target.value)} />
      </FormField>

      {/* RIGHT COLUMN */}
      <FormField label="Project Description" error={errors.description}>
        <textarea className="text-input" rows={3} value={formData.description} onChange={(e) => onChange("description", e.target.value)} placeholder="Brief description of the project..." style={{ resize: "vertical", width: "100%", boxSizing: "border-box", minHeight: "80px" }} />
      </FormField>

      <FormField label="Department / Ministry *" error={errors.department}>
        <input type="text" className="text-input" value={formData.department} onChange={(e) => onChange("department", e.target.value)} placeholder="e.g., Ministry of Road Transport and Highways" />
      </FormField>

      <FormField label="District *" error={errors.district}>
        <input type="text" className="text-input" value={formData.district} onChange={(e) => onChange("district", e.target.value)} placeholder="e.g., Kota" />
      </FormField>

      <FormField label="Village *" error={errors.village}>
        <input type="text" className="text-input" value={formData.village} onChange={(e) => onChange("village", e.target.value)} placeholder="e.g., Mandana" />
      </FormField>

      <FormField label="Estimated Land Requirement *" error={errors.estimatedLandRequirement}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "12px", alignItems: "start" }}>
          <input type="number" className="text-input" value={formData.estimatedLandRequirement} onChange={(e) => onChange("estimatedLandRequirement", e.target.value)} placeholder="e.g., 185.5" step="0.1" min="0" style={{ width: "100%" }} />
          <select className="select-input" value={formData.unit} onChange={(e) => onChange("unit", e.target.value)} style={{ width: "140px", minWidth: "140px", flexShrink: 0 }}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </FormField>

      <FormField label="Expected Completion Date *" error={errors.expectedCompletionDate}>
        <input type="date" className="text-input" value={formData.expectedCompletionDate} onChange={(e) => onChange("expectedCompletionDate", e.target.value)} />
      </FormField>
    </div>
  );
}

// Step 2: Land Requirement
function LandRequirementStep({ formData, errors, onChange, onAddLocation, onRemoveLocation }) {

  return (
    <div>
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <FormField label="Purpose of Land Acquisition *" error={errors.purposeOfAcquisition}>
          <textarea className="text-input" rows={3} value={formData.purposeOfAcquisition} onChange={(e) => onChange("purposeOfAcquisition", e.target.value)} placeholder="e.g., Right of way for expressway construction..." style={{ resize: "vertical" }} />
        </FormField>
        <FormField label="Required Area *" error={errors.requiredArea}>
          <input type="number" className="text-input" value={formData.requiredArea} onChange={(e) => onChange("requiredArea", e.target.value)} placeholder="e.g., 185.5" step="0.1" min="0" />
        </FormField>
        <FormField label="Number of Expected Parcels *" error={errors.expectedParcels}>
          <input type="number" className="text-input" value={formData.expectedParcels} onChange={(e) => onChange("expectedParcels", e.target.value)} placeholder="e.g., 247" step="1" min="1" />
        </FormField>
        <FormField label="Government / Private / Mixed Land *" error={errors.landType}>
          <select className="select-input" value={formData.landType} onChange={(e) => onChange("landType", e.target.value)}>
            <option value="">Select land type</option>
            {LAND_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)", marginBottom: "12px" }}>Location Entries</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {formData.locations.map((loc, idx) => (
            <div key={loc.id} className="card card-pad" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-end" }}>
              <FormField label="Location Name *" error={errors[`locationName-${idx}`]} style={{ flex: 1, minWidth: "200px" }}>
                <input type="text" className="text-input" value={loc.name} onChange={(e) => onChange("locations", idx, "name", e.target.value)} placeholder="e.g., Main Alignment - Mandana Village" />
              </FormField>
              <FormField label="Latitude *" error={errors[`latitude-${idx}`]} style={{ minWidth: "180px" }}>
                <input type="number" className="text-input" value={loc.latitude} onChange={(e) => onChange("locations", idx, "latitude", e.target.value)} placeholder="e.g., 25.2138" step="0.0001" min="-90" max="90" />
              </FormField>
              <FormField label="Longitude *" error={errors[`longitude-${idx}`]} style={{ minWidth: "180px" }}>
                <input type="number" className="text-input" value={loc.longitude} onChange={(e) => onChange("locations", idx, "longitude", e.target.value)} placeholder="e.g., 75.8648" step="0.0001" min="-180" max="180" />
              </FormField>
              {formData.locations.length > 1 && (
                <button type="button" className="btn btn-outline" style={{ height: "36px" }} onClick={() => onRemoveLocation(loc.id)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-outline" onClick={onAddLocation} style={{ marginTop: "8px" }}>
          <Plus size={14} aria-hidden="true" />
          Add Another Location
        </button>
      </div>
    </div>
  );
}

// Step 3: Submission Details
function SubmissionDetailsStep({ formData, errors, onChange }) {

  return (
    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
      <FormField label="Submission Mode *">
        <select className="select-input" value={formData.submissionMode} onChange={(e) => onChange("submissionMode", e.target.value)}>
          {SUBMISSION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </FormField>
      {formData.submissionMode === "Existing Portal" && (
        <FormField label="Existing Portal / Reference ID *" error={errors.portalReferenceId}>
          <input type="text" className="text-input" value={formData.portalReferenceId} onChange={(e) => onChange("portalReferenceId", e.target.value)} placeholder="e.g., WDFC-NR-2026-0456" />
        </FormField>
      )}
      {formData.submissionMode === "Government API" && (
        <FormField label="Government API / Transaction ID *" error={errors.apiTransactionId}>
          <input type="text" className="text-input" value={formData.apiTransactionId} onChange={(e) => onChange("apiTransactionId", e.target.value)} placeholder="e.g., DPIIT-API-2026-001234" />
        </FormField>
      )}
      {formData.submissionMode === "Manual Submission" && (
        <FormField label="Document Upload" style={{ gridColumn: "1 / -1" }}>
          <div className="upload-area" style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius)", padding: "32px", textAlign: "center", background: "var(--bg)" }}>
            <p style={{ color: "var(--muted)", marginBottom: "12px" }}>Drag and drop proposal documents here, or click to browse</p>
            <p style={{ fontSize: 12, color: "var(--faint)" }}>Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)</p>
            <button className="btn btn-outline" style={{ marginTop: "12px" }}>Browse Files</button>
          </div>
        </FormField>
      )}
    </div>
  );
}

// Step 4: Documents
function DocumentsStep({ formData, onAddDocument, onRemoveDocument }) {

  return (
    <div>
      <p style={{ color: "var(--muted)", marginBottom: "16px" }}>Add proposal documents. For the prototype, documents use mock/local handling.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {formData.documents.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: "center", color: "var(--muted)" }}>
            No documents added yet. Click "Add Document" to start.
          </div>
        ) : (
          formData.documents.map((doc, idx) => (
            <div key={doc.id} className="card card-pad" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-end" }}>
              <FormField label="Document Type *" style={{ flex: 1, minWidth: "200px" }}>
                <select className="select-input" value={doc.type} onChange={(e) => onChange("documents", idx, "type", e.target.value)}>
                  <option value="">Select document type</option>
                  {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="File Name *" style={{ flex: 1, minWidth: "200px" }}>
                <input type="text" className="text-input" value={doc.name} onChange={(e) => onChange("documents", idx, "name", e.target.value)} placeholder="e.g., Project_Proposal.pdf" />
              </FormField>
              <FormField label="Upload Date" style={{ minWidth: "180px" }}>
                <input type="date" className="text-input" value={doc.uploadedAt?.split("T")[0] || ""} onChange={(e) => onChange("documents", idx, "uploadedAt", e.target.value + "T00:00:00")} />
              </FormField>
              <button type="button" className="btn btn-outline" style={{ height: "36px" }} onClick={() => onRemoveDocument(doc.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      <button type="button" className="btn btn-outline" onClick={onAddDocument} style={{ marginTop: "16px" }}>
        <Plus size={14} aria-hidden="true" />
        Add Document
      </button>
    </div>
  );
}

// Step 5: Review & Submit
function ReviewSubmitStep({ formData }) {
  const formatCurrency = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "—";
    return "₹" + num.toLocaleString("en-IN");
  };

  const formatNumber = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "—";
    return num.toLocaleString("en-IN");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <ReviewSection title="Project Information">
        <ReviewRow label="Project Name" value={formData.projectName} />
        <ReviewRow label="Description" value={formData.description} />
        <ReviewRow label="Project Type" value={formData.projectType} />
        <ReviewRow label="Department" value={formData.department} />
        <ReviewRow label="State" value={formData.state} />
        <ReviewRow label="District" value={formData.district} />
        <ReviewRow label="Tehsil" value={formData.tehsil} />
        <ReviewRow label="Village" value={formData.village} />
        <ReviewRow label="Estimated Cost" value={formatCurrency(formData.estimatedCost)} />
        <ReviewRow label="Estimated Land Requirement" value={`${formatNumber(formData.estimatedLandRequirement)} ${formData.unit}`} />
        <ReviewRow label="Start Date" value={formData.expectedStartDate} />
        <ReviewRow label="Completion Date" value={formData.expectedCompletionDate} />
      </ReviewSection>

      <ReviewSection title="Land Requirement">
        <ReviewRow label="Purpose of Acquisition" value={formData.purposeOfAcquisition} />
        <ReviewRow label="Required Area" value={`${formatNumber(formData.requiredArea)} ${formData.unit}`} />
        <ReviewRow label="Expected Parcels" value={formatNumber(formData.expectedParcels)} />
        <ReviewRow label="Land Type" value={formData.landType} />
        <ReviewRow label="Locations" value={formData.locations.map((l) => l.name).join(", ") || "—"} />
      </ReviewSection>

      <ReviewSection title="Submission Details">
        <ReviewRow label="Submission Mode" value={formData.submissionMode} />
        {formData.submissionMode === "Existing Portal" && <ReviewRow label="Portal Reference ID" value={formData.portalReferenceId} />}
        {formData.submissionMode === "Government API" && <ReviewRow label="API Transaction ID" value={formData.apiTransactionId} />}
      </ReviewSection>

      <ReviewSection title="Documents">
        {formData.documents.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {formData.documents.map((doc, idx) => (
              <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <span>{doc.type}: {doc.name}</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{doc.uploadedAt?.split("T")[0]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)" }}>No documents added</p>
        )}
      </ReviewSection>
    </div>
  );
}

function FormField({ label, error, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--navy)", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: "var(--red)", fontSize: 11, marginTop: "4px" }}>{error}</p>}
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="card card-pad">
      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>{title}</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: 13, color: "var(--navy)" }}>{value || "—"}</p>
    </div>
  );
}

// Proposal Detail Modal
function ProposalDetailModal({ proposal, onClose, onOpenClassification, onOpenHierarchy }) {

  const getStageStatus = (stage) => {
    const historyEntry = proposal.workflowHistory?.find((h) => h.stage === stage);
    return historyEntry?.status || "Pending";
  };

  const getStageIcon = (stage) => {
    const status = getStageStatus(stage);
    if (status === "Completed") return <CheckCircle size={16} style={{ color: "var(--green)" }} />;
    if (status === "In Progress") return <Clock size={16} style={{ color: "var(--primary)", animation: "pulse 2s infinite" }} />;
    if (status === "Sent Back") return <AlertCircle size={16} style={{ color: "var(--orange)" }} />;
    if (status === "Rejected") return <XCircle size={16} style={{ color: "var(--red)" }} />;
    return <Clock size={16} style={{ color: "var(--muted)" }} />;
  };

  const getStageConnector = (index) => {
    if (index >= PROPOSAL_STAGES.length - 1) return null;
    const currentStage = PROPOSAL_STAGES[index];
    const nextStage = PROPOSAL_STAGES[index + 1];
    const currentStatus = getStageStatus(currentStage);
    const nextStatus = getStageStatus(nextStage);
    const isActive = currentStatus === "Completed" || nextStatus === "In Progress" || nextStatus === "Completed";
    return (
      <div style={{ flex: 1, height: 2, background: isActive ? "var(--primary)" : "var(--border)", marginTop: 7 }} />
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-label={proposal.projectName}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px", width: "95vw", maxHeight: "90vh" }}
      >
        <div className="modal-head">
          <div>
            <span className="proj-id">{proposal.id}</span>
            <h2 className="modal-title">{proposal.projectName}</h2>
            <div className="modal-subrow">
              <StatusBadge status={proposal.status} />
              <StageBadge stage={proposal.currentStage} />
              <span className="alert-meta-span">
                <MapPin size={13} aria-hidden="true" />
                {proposal.district}, {proposal.state}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {onOpenClassification && (
              <button 
                className="btn btn-outline" 
                onClick={() => onOpenClassification(proposal)}
                style={{ height: "36px", fontSize: 12 }}
              >
                Open Classification
              </button>
            )}
            {proposal.currentStage === "Hierarchy Verification" && (
              <button 
                className="btn btn-primary" 
                onClick={() => onOpenHierarchy(proposal)}
                style={{ height: "36px", fontSize: 12 }}
              >
                Open Hierarchy
              </button>
            )}
            <button className="icon-btn" onClick={onClose} aria-label="Close proposal details">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: "20px 24px", maxHeight: "65vh", overflow: "auto" }}>
          {/* Workflow Timeline */}
          <h3 className="modal-section-title">Approval Workflow</h3>
          <div className="workflow-timeline" style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "24px" }}>
            {PROPOSAL_STAGES.map((stage, idx) => (
              <div key={stage} style={{ display: "flex", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div
                    className="timeline-node"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: getStageStatus(stage) === "Completed" ? "var(--green)" :
                                  getStageStatus(stage) === "In Progress" ? "var(--primary)" :
                                  getStageStatus(stage) === "Sent Back" ? "var(--orange)" :
                                  getStageStatus(stage) === "Rejected" ? "var(--red)" : "var(--border)",
                      color: getStageStatus(stage) === "Pending" ? "var(--muted)" : "#fff",
                      border: "2px solid",
                      borderColor: getStageStatus(stage) === "Completed" ? "var(--green)" :
                                   getStageStatus(stage) === "In Progress" ? "var(--primary)" :
                                   getStageStatus(stage) === "Sent Back" ? "var(--orange)" :
                                   getStageStatus(stage) === "Rejected" ? "var(--red)" : "var(--border)",
                      zIndex: 2,
                      boxShadow: getStageStatus(stage) === "In Progress" ? "0 0 0 4px var(--primary-soft)" : "none",
                    }}
                  >
                    {getStageIcon(stage)}
                  </div>
                  {getStageConnector(idx)}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 14 }}>{stage}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {getStageStatus(stage) === "Completed" && (
                      <span style={{ color: "var(--green)" }}>✓ Completed</span>
                    )}
                    {getStageStatus(stage) === "In Progress" && (
                      <span style={{ color: "var(--primary)" }}>⟳ In Progress</span>
                    )}
                    {getStageStatus(stage) === "Sent Back" && (
                      <span style={{ color: "var(--orange)" }}>↩ Sent Back</span>
                    )}
                    {getStageStatus(stage) === "Rejected" && (
                      <span style={{ color: "var(--red)" }}>✗ Rejected</span>
                    )}
                    {getStageStatus(stage) === "Pending" && (
                      <span style={{ color: "var(--muted)" }}>⏳ Pending</span>
                    )}
                  </div>
                  {proposal.workflowHistory && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                      {proposal.workflowHistory
                        .filter((h) => h.stage === stage)
                        .map((h, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ color: "var(--primary)", fontWeight: 500 }}>{h.by}:</span>
                            <span>{h.remarks}</span>
                            {h.at && <span style={{ color: "var(--faint)", marginLeft: "8px" }}>{formatTimestamp(h.at)}</span>}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Proposal Overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <DetailCard title="Proposal Overview">
              <DetailRow label="Proposal ID" value={proposal.id} />
              <DetailRow label="Status" value={<StatusBadge status={proposal.status} />} />
              <DetailRow label="Current Stage" value={<StageBadge stage={proposal.currentStage} />} />
              <DetailRow label="Submitted" value={proposal.submittedAt ? formatTimestamp(proposal.submittedAt) : "Not submitted"} />
              <DetailRow label="Last Updated" value={formatTimestamp(proposal.updatedAt)} />
            </DetailCard>

            <DetailCard title="Project Information">
              <DetailRow label="Project Name" value={proposal.projectName} />
              <DetailRow label="Description" value={proposal.description} />
              <DetailRow label="Project Type" value={proposal.projectType} />
              <DetailRow label="Department" value={proposal.department} />
              <DetailRow label="State" value={proposal.state} />
              <DetailRow label="District" value={proposal.district} />
              <DetailRow label="Tehsil" value={proposal.tehsil} />
              <DetailRow label="Village" value={proposal.village} />
              <DetailRow label="Estimated Cost" value={`₹${Number(proposal.estimatedCost).toLocaleString("en-IN")}`} />
              <DetailRow label="Estimated Land" value={`${proposal.estimatedLandRequirement} ${proposal.unit}`} />
              <DetailRow label="Expected Start" value={proposal.expectedStartDate} />
              <DetailRow label="Expected Completion" value={proposal.expectedCompletionDate} />
            </DetailCard>

            <DetailCard title="Land Requirement">
              <DetailRow label="Purpose" value={proposal.purposeOfAcquisition} />
              <DetailRow label="Required Area" value={`${proposal.requiredArea} ${proposal.unit}`} />
              <DetailRow label="Expected Parcels" value={proposal.expectedParcels} />
              <DetailRow label="Land Type" value={proposal.landType} />
            </DetailCard>

            <DetailCard title="Locations">
              {proposal.locations?.map((loc, idx) => (
                <div key={loc.id} style={{ marginBottom: "12px", padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>{loc.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    Lat: {loc.latitude}, Long: {loc.longitude}
                  </div>
                </div>
              ))}
            </DetailCard>

            <DetailCard title="Submission Information">
              <DetailRow label="Submission Mode" value={proposal.submissionMode} />
              {proposal.submissionMode === "Existing Portal" && <DetailRow label="Portal Reference ID" value={proposal.portalReferenceId} />}
              {proposal.submissionMode === "Government API" && <DetailRow label="API Transaction ID" value={proposal.apiTransactionId} />}
            </DetailCard>

            <DetailCard title="Documents">
              {proposal.documents?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {proposal.documents.map((doc, idx) => (
                    <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                      <span>{doc.type}: {doc.name}</span>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>{doc.uploadedAt?.split("T")[0]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--muted)" }}>No documents attached</p>
              )}
            </DetailCard>

            {/* Project Classification */}
            {proposal.classification && proposal.classification.category && (
              <DetailCard title="Project Classification" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  <DetailRow label="Category" value={proposal.classification.category} />
                  <DetailRow label="Project Type" value={proposal.classification.projectType} />
                  <DetailRow label="Land Acquisition Type" value={proposal.classification.landAcquisitionType} />
                  <DetailRow label="Project Scale" value={proposal.classification.projectScale} />
                  <DetailRow label="Acquisition Complexity" value={proposal.classification.acquisitionComplexity} />
                  <DetailRow label="Classification Status" value={<StatusBadge status={proposal.classification.status} />} />
                  <DetailRow label="Classified By" value={proposal.classification.classifiedBy || "—"} />
                  <DetailRow label="Classified Date" value={proposal.classification.classifiedAt ? formatTimestamp(proposal.classification.classifiedAt) : "—"} />
                </div>
                {proposal.classification.remarks && (
                  <div style={{ padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Remarks</p>
                    <p style={{ fontSize: 13, color: "var(--navy)" }}>{proposal.classification.remarks}</p>
                  </div>
                )}
              </DetailCard>
            )}

            {/* Classification & Authority Levels */}
            {proposal.classification && (
              <DetailCard title="Approval Hierarchy" style={{ gridColumn: "1 / -1" }}>
                <div className="table-scroll">
                  <table className="data-table" style={{ minWidth: "auto" }}>
                    <thead>
                      <tr>
                        <th>Level</th>
                        <th>Authority</th>
                        <th>Officer</th>
                        <th>Designation</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Action Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.classification.authorityLevels?.map((auth, idx) => (
                        <tr key={auth.level}>
                          <td>{auth.level}</td>
                          <td>{auth.name}</td>
                          <td>{auth.officer || "—"}</td>
                          <td>{auth.designation || "—"}</td>
                          <td><StatusBadge status={auth.status} /></td>
                          <td>{auth.remarks || "—"}</td>
                          <td>{auth.actionAt ? formatTimestamp(auth.actionAt) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailCard>
            )}

            {/* Activity History */}
            {proposal.workflowHistory && proposal.workflowHistory.length > 0 && (
              <DetailCard title="Activity History" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {proposal.workflowHistory.map((entry, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: `3px solid ${getStatusColor(entry.status)}` }}>
                      <div style={{ minWidth: "140px", fontWeight: 600, color: "var(--navy)" }}>{entry.stage}</div>
                      <div style={{ flex: 1, color: "var(--text)" }}>{entry.remarks}</div>
                      <div style={{ minWidth: "180px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                        <span style={{ fontSize: 12, color: getStatusColor(entry.status), fontWeight: 600 }}>{entry.status}</span>
                        <span style={{ fontSize: 11, color: "var(--faint)" }}>{entry.by}</span>
                        {entry.at && <span style={{ fontSize: 11, color: "var(--faint)" }}>{formatTimestamp(entry.at)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailCard>
            )}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, children, style }) {
  return (
    <div className="card card-pad" style={style}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>{title}</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>{children}</div>
    </div>
  );
}

// Classification Modal
function ClassificationModal({ proposal, onClose, onSave }) {
  const [classification, setClassification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (proposal) {
      // Initialize with existing classification or auto-generated
      const existing = proposal.classification;
      if (existing && existing.category) {
        setClassification({
          category: existing.category || "",
          projectType: existing.projectType || proposal.projectType,
          landAcquisitionType: existing.landAcquisitionType || "",
          projectScale: existing.projectScale || "",
          acquisitionComplexity: existing.acquisitionComplexity || "",
          status: existing.status || "Pending",
          remarks: existing.remarks || "",
        });
      } else {
        // Generate auto-classification
        const auto = generateAutoClassification(proposal);
        setClassification({
          category: auto.category,
          projectType: auto.projectType,
          landAcquisitionType: auto.landAcquisitionType,
          projectScale: auto.projectScale,
          acquisitionComplexity: auto.acquisitionComplexity,
          status: "Classified",
          remarks: auto.remarks,
        });
      }
    }
  }, [proposal]);

  const handleChange = (field, value) => {
    setClassification((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateClassification = () => {
    if (!classification.category) return "Project Category is required";
    if (!classification.projectType) return "Project Type is required";
    if (!classification.landAcquisitionType) return "Land Acquisition Type is required";
    if (!classification.projectScale) return "Project Scale is required";
    if (!classification.acquisitionComplexity) return "Acquisition Complexity is required";
    return null;
  };

  const handleSave = async () => {
    const validationError = validateClassification();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        category: classification.category,
        projectType: classification.projectType,
        landAcquisitionType: classification.landAcquisitionType,
        projectScale: classification.projectScale,
        acquisitionComplexity: classification.acquisitionComplexity,
        status: classification.status,
        remarks: classification.remarks,
      };
      await updateProposalClassification(proposal.id, payload);
      onSave(payload);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save classification: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoClassify = () => {
    const auto = generateAutoClassification(proposal);
    setClassification((prev) => ({
      ...prev,
      category: auto.category,
      projectType: auto.projectType,
      landAcquisitionType: auto.landAcquisitionType,
      projectScale: auto.projectScale,
      acquisitionComplexity: auto.acquisitionComplexity,
      status: "Classified",
      remarks: auto.remarks,
    }));
  };

  if (!proposal) return null;

  const classificationLabel = (value) => (
    <span style={{ 
      display: "inline-flex", 
      alignItems: "center", 
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: 12,
      fontWeight: 600,
      background: "var(--primary-soft)",
      color: "var(--primary)",
      border: "1px solid var(--primary-border)",
    }}>
      {value}
      {classification?.isAutoClassified && <span style={{ fontSize: 10, opacity: 0.8 }}>Auto</span>}
    </span>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-label="Project Classification"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px", width: "95vw", maxHeight: "90vh" }}
      >
        <div className="modal-head">
          <div>
            <span className="proj-id">{proposal.id}</span>
            <h2 className="modal-title">Project Classification</h2>
            <div className="modal-subrow">
              <span className="category-chip">{proposal.projectName}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "24px", maxHeight: "70vh", overflow: "auto" }}>
          {error && (
            <div style={{ 
              padding: "12px 16px", 
              background: "var(--red-soft)", 
              border: "1px solid var(--red-border)", 
              borderRadius: "var(--radius-sm)", 
              color: "var(--red)", 
              marginBottom: "16px",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              {error}
              <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* Proposal Header Info */}
          <div className="card card-pad" style={{ marginBottom: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Proposal ID</p>
                <p style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600 }}>{proposal.id}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Project Name</p>
                <p style={{ fontSize: 13, color: "var(--navy)" }}>{proposal.projectName}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Department</p>
                <p style={{ fontSize: 13, color: "var(--navy)" }}>{proposal.department}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>State / District</p>
                <p style={{ fontSize: 13, color: "var(--navy)" }}>{proposal.district}, {proposal.state}</p>
              </div>
            </div>
          </div>

          {/* Classification Form */}
          <div className="card card-pad" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Classification Details</h3>
              {!isEditing && classification?.isAutoClassified && (
                <button 
                  className="btn btn-outline" 
                  onClick={handleAutoClassify}
                  style={{ fontSize: 12 }}
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  Re-run Auto Classification
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px 24px" }}>
              {/* Project Category */}
              <FormField label="Project Category *" error={!isEditing ? null : (error && error.includes("Category") ? error : null)}>
                {isEditing ? (
                  <select className="select-input" value={classification.category} onChange={(e) => handleChange("category", e.target.value)}>
                    <option value="">Select category</option>
                    {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <classificationLabel>{classification.category || "—"}</classificationLabel>
                )}
              </FormField>

              {/* Project Type */}
              <FormField label="Project Type *" error={!isEditing ? null : (error && error.includes("Type") ? error : null)}>
                {isEditing ? (
                  <select className="select-input" value={classification.projectType} onChange={(e) => handleChange("projectType", e.target.value)}>
                    <option value="">Select project type</option>
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <classificationLabel>{classification.projectType || "—"}</classificationLabel>
                )}
              </FormField>

              {/* Land Acquisition Type */}
              <FormField label="Land Acquisition Type *" error={!isEditing ? null : (error && error.includes("Land") ? error : null)}>
                {isEditing ? (
                  <select className="select-input" value={classification.landAcquisitionType} onChange={(e) => handleChange("landAcquisitionType", e.target.value)}>
                    <option value="">Select land acquisition type</option>
                    {LAND_ACQUISITION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <classificationLabel>{classification.landAcquisitionType || "—"}</classificationLabel>
                )}
              </FormField>

              {/* Project Scale */}
              <FormField label="Project Scale *" error={!isEditing ? null : (error && error.includes("Scale") ? error : null)}>
                {isEditing ? (
                  <select className="select-input" value={classification.projectScale} onChange={(e) => handleChange("projectScale", e.target.value)}>
                    <option value="">Select project scale</option>
                    {PROJECT_SCALES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <classificationLabel>{classification.projectScale || "—"}</classificationLabel>
                )}
              </FormField>

              {/* Acquisition Complexity */}
              <FormField label="Acquisition Complexity *" error={!isEditing ? null : (error && error.includes("Complexity") ? error : null)}>
                {isEditing ? (
                  <select className="select-input" value={classification.acquisitionComplexity} onChange={(e) => handleChange("acquisitionComplexity", e.target.value)}>
                    <option value="">Select complexity</option>
                    {ACQUISITION_COMPLEXITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <classificationLabel>{classification.acquisitionComplexity || "—"}</classificationLabel>
                )}
              </FormField>

              {/* Classification Status */}
              <FormField label="Classification Status">
                {isEditing ? (
                  <select className="select-input" value={classification.status} onChange={(e) => handleChange("status", e.target.value)}>
                    {CLASSIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <StatusBadge status={classification.status} />
                )}
              </FormField>

              {/* Remarks */}
              <FormField label="Remarks" style={{ gridColumn: "1 / -1" }}>
                {isEditing ? (
                  <textarea 
                    className="text-input" 
                    rows={3} 
                    value={classification.remarks} 
                    onChange={(e) => handleChange("remarks", e.target.value)} 
                    placeholder="Classification remarks..."
                    style={{ resize: "vertical", width: "100%", boxSizing: "border-box" }}
                  />
                ) : (
                  <p style={{ fontSize: 13, color: "var(--navy)", minHeight: "60px" }}>{classification.remarks || "—"}</p>
                )}
              </FormField>
            </div>
          </div>

          {/* Classification Summary */}
          <div className="card card-pad" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>Classification Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Category</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>{classification.category}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Type</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>{classification.projectType}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Land</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>{classification.landAcquisitionType}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Scale</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>{classification.projectScale}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Complexity</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>{classification.acquisitionComplexity}</p>
              </div>
            </div>
          </div>

          {/* Authority Levels Preview */}
          {classification.category && (
            <div className="card card-pad">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>Required Authority Levels (Preview)</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: "12px" }}>Based on category: <strong>{classification.category}</strong></p>
              <div className="table-scroll">
                <table className="data-table" style={{ minWidth: "auto" }}>
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Authority</th>
                      <th>Designation</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateAuthorityLevels(classification.category).map((auth, idx) => (
                      <tr key={auth.level}>
                        <td>{auth.level}</td>
                        <td>{auth.name}</td>
                        <td>{auth.designation}</td>
                        <td><span className="status-badge" style={{ background: "var(--amber-soft)", color: "var(--amber)", borderColor: "var(--amber-border)" }}>{auth.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot" style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>
            Close
          </button>
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            {isEditing ? (
              <>
                <button className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Classification"}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <Edit size={14} aria-hidden="true" />
                Edit Classification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hierarchy Modal
function HierarchyModal({ proposal, onClose, onSave }) {
  const [hierarchy, setHierarchy] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (proposal && proposal.classification) {
      setHierarchy({
        authorityLevels: proposal.classification.authorityLevels || [],
        category: proposal.classification.category || "",
      });
    }
  }, [proposal]);

  const handleConfigChange = (level, field, value) => {
    setHierarchy((prev) => ({
      ...prev,
      authorityLevels: prev.authorityLevels.map((auth) =>
        auth.level === level ? { ...auth, [field]: value } : auth
      ),
    }));
    if (error) setError(null);
  };

  const validateHierarchy = () => {
    const levels = hierarchy.authorityLevels;
    for (const auth of levels) {
      if (!auth.name) return `Authority name is required for Level ${auth.level}`;
      if (!auth.designation) return `Designation is required for Level ${auth.level}`;
    }
    return null;
  };

  const handleSaveHierarchy = async () => {
    const validationError = validateHierarchy();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        authorityLevels: hierarchy.authorityLevels,
      };
      await updateProposalHierarchy(proposal.id, payload);
      onSave({ ...proposal, classification: { ...proposal.classification, authorityLevels: hierarchy.authorityLevels } });
      setIsConfiguring(false);
    } catch (err) {
      setError("Failed to save hierarchy: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentAuthorityLevel = () => {
    return hierarchy.authorityLevels.find((auth) => auth.status === "In Review") ||
           hierarchy.authorityLevels.find((auth) => auth.status === "Pending");
  };

  const getCompletedCount = () => {
    return hierarchy.authorityLevels.filter((auth) => auth.status === "Approved").length;
  };

  const getRemainingCount = () => {
    return hierarchy.authorityLevels.filter((auth) => auth.status === "Pending" || auth.status === "In Review").length;
  };

  const handleApprove = async () => {
    const currentAuth = getCurrentAuthorityLevel();
    if (!currentAuth) return;

    if (!window.confirm(`Approve Level ${currentAuth.level}: ${currentAuth.name}?`)) return;

    setActionLoading(currentAuth.level);
    try {
      await approveAuthorityLevel(proposal.id, {
        authorityLevel: currentAuth.level,
        officer: currentAuth.officer,
        designation: currentAuth.designation,
        remarks: "Approved",
      });
      const data = await getProposals();
      onSave(data.find((p) => p.id === proposal.id));
    } catch (err) {
      setError("Failed to approve: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    const currentAuth = getCurrentAuthorityLevel();
    if (!currentAuth) return;

    const remarks = window.prompt("Rejection reason (required):");
    if (!remarks || remarks.trim() === "") {
      alert("Rejection reason is required");
      return;
    }

    setActionLoading(currentAuth.level);
    try {
      await rejectAuthorityLevel(proposal.id, {
        authorityLevel: currentAuth.level,
        officer: currentAuth.officer,
        designation: currentAuth.designation,
        remarks,
      });
      const data = await getProposals();
      onSave(data.find((p) => p.id === proposal.id));
    } catch (err) {
      setError("Failed to reject: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendBack = async () => {
    const currentAuth = getCurrentAuthorityLevel();
    if (!currentAuth) return;

    const remarks = window.prompt("Remarks for send back (required):");
    if (!remarks || remarks.trim() === "") {
      alert("Remarks are required for send back");
      return;
    }

    setActionLoading(currentAuth.level);
    try {
      await sendBackAuthorityLevel(proposal.id, {
        authorityLevel: currentAuth.level,
        officer: currentAuth.officer,
        designation: currentAuth.designation,
        remarks,
      });
      const data = await getProposals();
      onSave(data.find((p) => p.id === proposal.id));
    } catch (err) {
      setError("Failed to send back: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResubmit = async () => {
    if (!window.confirm("Resubmit proposal after corrections?")) return;

    setActionLoading("resubmit");
    try {
      await resubmitProposal(proposal.id);
      const data = await getProposals();
      onSave(data.find((p) => p.id === proposal.id));
    } catch (err) {
      setError("Failed to resubmit: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved": return <CheckCircle size={16} style={{ color: "var(--green)" }} />;
      case "In Review": return <Clock size={16} style={{ color: "var(--primary)", animation: "pulse 2s infinite" }} />;
      case "Sent Back": return <AlertCircle size={16} style={{ color: "var(--orange)" }} />;
      case "Rejected": return <XCircle size={16} style={{ color: "var(--red)" }} />;
      default: return <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--border)", display: "inline-block" }} />;
    }
  };

  const getStatusBadgeColors = (status) => {
    switch (status) {
      case "Approved": return { bg: "var(--green-soft)", border: "var(--green-border)", text: "var(--green)" };
      case "In Review": return { bg: "var(--primary-soft)", border: "var(--primary-border)", text: "var(--primary)" };
      case "Sent Back": return { bg: "var(--orange-soft)", border: "var(--orange-border)", text: "var(--orange)" };
      case "Rejected": return { bg: "var(--red-soft)", border: "var(--red-border)", text: "var(--red)" };
      default: return { bg: "var(--amber-soft)", border: "var(--amber-border)", text: "var(--amber)" };
    }
  };

  const isCurrentAuthority = (auth) => {
    const current = getCurrentAuthorityLevel();
    return current && current.level === auth.level;
  };

  if (!proposal || !hierarchy) return null;

  const currentAuth = getCurrentAuthorityLevel();
  const completedCount = getCompletedCount();
  const totalLevels = hierarchy.authorityLevels.length;
  const remainingCount = getRemainingCount();
  const overallStatus = proposal.status;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-label="Approval Hierarchy"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px", width: "95vw", maxHeight: "90vh" }}
      >
        <div className="modal-head">
          <div>
            <span className="proj-id">{proposal.id}</span>
            <h2 className="modal-title">Approval Hierarchy</h2>
            <div className="modal-subrow">
              <span className="category-chip">{proposal.projectName}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "24px", maxHeight: "70vh", overflow: "auto" }}>
          {error && (
            <div style={{
              padding: "12px 16px",
              background: "var(--red-soft)",
              border: "1px solid var(--red-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--red)",
              marginBottom: "16px",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              {error}
              <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* Proposal Header Info */}
          <div className="card card-pad" style={{ marginBottom: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Proposal ID</p>
                <p style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600 }}>{proposal.id}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Project Name</p>
                <p style={{ fontSize: 13, color: "var(--navy)" }}>{proposal.projectName}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Category</p>
                <p style={{ fontSize: 13, color: "var(--navy)" }}>{hierarchy.category}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Current Stage</p>
                <p style={{ fontSize: 13, color: "var(--navy)" }}>{proposal.currentStage}</p>
              </div>
            </div>
          </div>

          {/* Hierarchy Summary */}
          <div className="card card-pad" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: "16px" }}>Hierarchy Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "4px solid var(--primary)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Total Levels</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>{totalLevels}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "4px solid var(--green)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Completed</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>{completedCount}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "4px solid var(--primary)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Current</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>{currentAuth ? `Level ${currentAuth.level}: ${currentAuth.name}` : "—"}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "4px solid var(--amber)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Remaining</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "var(--amber)" }}>{remainingCount}</p>
              </div>
              <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "4px solid var(--orange)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Overall Status</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>
                  <StatusBadge status={overallStatus} />
                </p>
              </div>
            </div>
          </div>

          {/* Authority Levels - Vertical Stepper */}
          <div className="card card-pad" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Authority Levels</h3>
              {!isConfiguring && (
                <button className="btn btn-outline" onClick={() => setIsConfiguring(true)} style={{ fontSize: 12 }}>
                  <Edit size={14} aria-hidden="true" />
                  Configure Officers
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {hierarchy.authorityLevels.map((auth, idx) => (
                <div key={auth.level} style={{ position: "relative" }}>
                  {/* Connector line */}
                  {idx < hierarchy.authorityLevels.length - 1 && (
                    <div style={{ position: "absolute", left: "28px", top: "48px", bottom: "0", width: "2px", background: "var(--border)", zIndex: 0 }} />
                  )}

                  <div style={{ display: "flex", gap: "16px", position: "relative", zIndex: 1, padding: "16px 0" }}>
                    {/* Level indicator */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        background: auth.status === "Approved" ? "var(--green)" :
                                    auth.status === "In Review" ? "var(--primary)" :
                                    auth.status === "Sent Back" ? "var(--orange)" :
                                    auth.status === "Rejected" ? "var(--red)" : "var(--border)",
                        color: auth.status === "Pending" ? "var(--muted)" : "#fff",
                        border: "3px solid",
                        borderColor: auth.status === "Approved" ? "var(--green)" :
                                     auth.status === "In Review" ? "var(--primary)" :
                                     auth.status === "Sent Back" ? "var(--orange)" :
                                     auth.status === "Rejected" ? "var(--red)" : "var(--border)",
                        boxShadow: auth.status === "In Review" ? "0 0 0 4px var(--primary-soft)" : "none",
                      }}>
                        {getStatusIcon(auth.status)}
                      </div>
                    </div>

                    {/* Authority details */}
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                        <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 14 }}>{auth.name}</div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--bg)", padding: "2px 8px", borderRadius: "999px" }}>Level {auth.level}</span>
                        {isCurrentAuthority(auth) && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--primary-soft)", padding: "2px 8px", borderRadius: "999px" }}>CURRENT</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: "4px" }}>
                        {auth.designation}
                        {auth.officer && <span style={{ marginLeft: "8px", color: "var(--navy)" }}> — {auth.officer}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <StatusBadge status={auth.status} />
                        {auth.assignedDate && (
                          <span style={{ fontSize: 11, color: "var(--faint)" }}>Assigned: {formatTimestamp(auth.assignedDate)}</span>
                        )}
                        {auth.actionAt && (
                          <span style={{ fontSize: 11, color: "var(--faint)" }}>Actioned: {formatTimestamp(auth.actionAt)}</span>
                        )}
                      </div>
                      {auth.remarks && (
                        <div style={{ marginTop: "8px", padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--navy)", borderLeft: "3px solid var(--primary)" }}>
                          <span style={{ fontWeight: 600, color: "var(--primary)" }}>Remarks: </span>{auth.remarks}
                        </div>
                      )}
                    </div>

                    {/* Actions for current authority */}
                    {isCurrentAuthority(auth) && proposal.status !== "Rejected" && proposal.status !== "Approved" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
                        {!isConfiguring && !actionLoading && (
                          <>
                            <button
                              className="btn btn-primary"
                              onClick={handleApprove}
                              disabled={actionLoading === auth.level}
                              style={{ width: "100%" }}
                            >
                              {actionLoading === auth.level ? "Approving..." : "Approve"}
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={handleSendBack}
                              disabled={actionLoading === auth.level}
                              style={{ width: "100%" }}
                            >
                              {actionLoading === auth.level ? "Sending Back..." : "Send Back"}
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ width: "100%", borderColor: "var(--red-border)", color: "var(--red)" }}
                              onClick={handleReject}
                              disabled={actionLoading === auth.level}
                            >
                              {actionLoading === auth.level ? "Rejecting..." : "Reject"}
                            </button>
                          </>
                        )}
                        {proposal.status === "Sent Back" && auth.status === "Sent Back" && !isConfiguring && !actionLoading && (
                          <button
                            className="btn btn-primary"
                            onClick={handleResubmit}
                            disabled={actionLoading === "resubmit"}
                            style={{ width: "100%", marginTop: "8px" }}
                          >
                            {actionLoading === "resubmit" ? "Resubmitting..." : "Resubmit"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Officer assignment in configure mode */}
                    {isConfiguring && isCurrentAuthority(auth) && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
                        <input
                          type="text"
                          className="text-input"
                          placeholder="Officer Name"
                          value={auth.officer || ""}
                          onChange={(e) => handleConfigChange(auth.level, "officer", e.target.value)}
                        />
                        <input
                          type="text"
                          className="text-input"
                          placeholder="Designation"
                          value={auth.designation || ""}
                          onChange={(e) => handleConfigChange(auth.level, "designation", e.target.value)}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            const updatedAuth = { ...auth, officer: auth.officer, designation: auth.designation, assignedDate: new Date().toISOString(), status: "In Review" };
                            handleConfigChange(auth.level, "officer", auth.officer);
                            handleConfigChange(auth.level, "designation", auth.designation);
                            handleConfigChange(auth.level, "assignedDate", new Date().toISOString());
                            handleConfigChange(auth.level, "status", "In Review");
                          }}
                          style={{ marginTop: "4px" }}
                        >
                          Assign & Set In Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Assignment / Configuration */}
          {isConfiguring && (
            <div className="card card-pad" style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: "16px" }}>Configure All Authority Officers</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: "16px" }}>Assign officers and designations for each authority level. The current authority will be set to "In Review".</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {hierarchy.authorityLevels.map((auth, idx) => (
                  <div key={auth.level} className="card card-pad" style={{ background: "var(--bg)" }}>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "12px" }}>Level {auth.level}: {auth.name}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                      <FormField label="Officer Name">
                        <input
                          type="text"
                          className="text-input"
                          value={auth.officer || ""}
                          onChange={(e) => handleConfigChange(auth.level, "officer", e.target.value)}
                          placeholder="e.g., R.K. Sharma"
                        />
                      </FormField>
                      <FormField label="Designation">
                        <input
                          type="text"
                          className="text-input"
                          value={auth.designation || ""}
                          onChange={(e) => handleConfigChange(auth.level, "designation", e.target.value)}
                          placeholder={auth.designation || "e.g., Chief Engineer (NH)"}
                        />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: "16px" }}>Workflow Progress</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {PROPOSAL_STAGES.map((stage, idx) => {
                const stageStatus = proposal.workflowHistory?.find((h) => h.stage === stage)?.status || "Pending";
                const isActive = stage === proposal.currentStage;
                return (
                  <div key={stage} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: isActive ? "var(--primary-soft)" : "var(--bg)", borderRadius: "var(--radius-sm)", border: isActive ? "1px solid var(--primary-border)" : "1px solid var(--border)" }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      background: stageStatus === "Completed" ? "var(--green)" :
                                  stageStatus === "In Progress" ? "var(--primary)" :
                                  stageStatus === "Sent Back" ? "var(--orange)" :
                                  stageStatus === "Rejected" ? "var(--red)" : "var(--border)",
                      color: stageStatus === "Pending" ? "var(--muted)" : "#fff",
                      border: "2px solid",
                      borderColor: stageStatus === "Completed" ? "var(--green)" :
                                   stageStatus === "In Progress" ? "var(--primary)" :
                                   stageStatus === "Sent Back" ? "var(--orange)" :
                                   stageStatus === "Rejected" ? "var(--red)" : "var(--border)",
                    }}>
                      {stageStatus === "Completed" ? <CheckCircle size={14} /> : idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{stage}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {stageStatus === "Completed" && <span style={{ color: "var(--green)" }}>✓ Completed</span>}
                        {stageStatus === "In Progress" && <span style={{ color: "var(--primary)" }}>⟳ In Progress</span>}
                        {stageStatus === "Sent Back" && <span style={{ color: "var(--orange)" }}>↩ Sent Back</span>}
                        {stageStatus === "Rejected" && <span style={{ color: "var(--red)" }}>✗ Rejected</span>}
                        {stageStatus === "Pending" && <span style={{ color: "var(--muted)" }}>⏳ Pending</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-foot" style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <button className="btn btn-outline" onClick={onClose} disabled={saving || actionLoading}>
            Close
          </button>
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            {isConfiguring ? (
              <>
                <button className="btn btn-outline" onClick={() => setIsConfiguring(false)} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveHierarchy} disabled={saving}>
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </>
            ) : (
              <>
                {proposal.status === "Sent Back" && (
                  <button className="btn btn-primary" onClick={handleResubmit} disabled={actionLoading === "resubmit"}>
                    {actionLoading === "resubmit" ? "Resubmitting..." : "Resubmit Proposal"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: 13, color: "var(--navy)" }}>{value}</p>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "Completed": return "var(--green)";
    case "In Progress": return "var(--primary)";
    case "Sent Back": return "var(--orange)";
    case "Rejected": return "var(--red)";
    default: return "var(--border)";
  }
}