// ---------------------------------------------------------------------------
// LADI Portal — API service layer (Phase 1)
// The Vite dev server proxies /api/* to the Express backend.
// ---------------------------------------------------------------------------

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_API_BASE_URL || ""
    : "";

const HEALTH_TIMEOUT_MS = 5000;

/**
 * Check backend service health.
 * Returns { status, service, timestamp } or throws on failure/timeout.
 */
export async function checkHealth({ signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  // Allow caller-provided signal to compose with our timeout signal.
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getJson(path, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return response.json();
}

async function postJson(path, body, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `POST ${path} failed with status ${response.status}`);
  }
  return response.json();
}

async function putJson(path, body, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `PUT ${path} failed with status ${response.status}`);
  }
  return response.json();
}

export async function getProjects({ signal } = {}) {
  const data = await getJson("/api/projects", { signal });
  return Array.isArray(data) ? data : data.projects || [];
}

export async function getProject(id, { signal } = {}) {
  return getJson(`/api/projects/${encodeURIComponent(id)}`, { signal });
}

export async function getAlerts({ signal } = {}) {
  const data = await getJson("/api/alerts", { signal });
  return Array.isArray(data) ? data : data.alerts || [];
}

export async function getAnalytics({ signal } = {}) {
  return getJson("/api/analytics", { signal });
}

export async function getDashboardData({ signal } = {}) {
  const [projects, alerts, analytics] = await Promise.all([
    getProjects({ signal }),
    getAlerts({ signal }),
    getAnalytics({ signal }),
  ]);
  return { projects, alerts, analytics };
}

// Proposal API functions
export async function getProposals(params = {}, { signal } = {}) {
  const query = new URLSearchParams(params).toString();
  const path = `/api/proposals${query ? `?${query}` : ""}`;
  const data = await getJson(path, { signal });
  return Array.isArray(data) ? data : data.proposals || [];
}

export async function getProposal(id, { signal } = {}) {
  return getJson(`/api/proposals/${encodeURIComponent(id)}`, { signal });
}

export async function createProposal(proposalData, { signal } = {}) {
  return postJson("/api/proposals", proposalData, { signal });
}

export async function updateProposal(id, proposalData, { signal } = {}) {
  return putJson(`/api/proposals/${encodeURIComponent(id)}`, proposalData, { signal });
}

export async function submitProposal(id, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/submit`, {}, { signal });
}

export async function approveProposal(id, approvalData, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/approve`, approvalData, { signal });
}

export async function rejectProposal(id, rejectionData, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/reject`, rejectionData, { signal });
}

export async function sendBackProposal(id, sendBackData, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/send-back`, sendBackData, { signal });
}

export async function resubmitProposal(id, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/resubmit`, {}, { signal });
}

export async function updateProposalClassification(id, classificationData, { signal } = {}) {
  return putJson(`/api/proposals/${encodeURIComponent(id)}/classification`, classificationData, { signal });
}

export async function updateProposalHierarchy(id, hierarchyData, { signal } = {}) {
  return putJson(`/api/proposals/${encodeURIComponent(id)}/hierarchy`, hierarchyData, { signal });
}

export async function approveAuthorityLevel(id, approvalData, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/approve`, approvalData, { signal });
}

export async function rejectAuthorityLevel(id, rejectionData, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/reject`, rejectionData, { signal });
}

export async function sendBackAuthorityLevel(id, sendBackData, { signal } = {}) {
  return postJson(`/api/proposals/${encodeURIComponent(id)}/send-back`, sendBackData, { signal });
}
