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
