const express = require("express");
const cors = require("cors");
const { projects, alerts, analytics } = require("./data/mockData.js");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "LADI Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/projects", (req, res) => {
  const { state, risk, q } = req.query;
  let list = projects;
  if (state) list = list.filter((p) => p.state === state);
  if (risk) list = list.filter((p) => p.risk === risk);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((p) =>
      [p.name, p.id, p.state, p.district]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  res.json(list);
});

app.get("/api/projects/:id", (req, res) => {
  const project = projects.find(
    (p) => p.id.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!project) {
    return res.status(404).json({ error: "Project not found", id: req.params.id });
  }
  res.json(project);
});

app.get("/api/alerts", (_req, res) => {
  res.json(alerts);
});

app.get("/api/analytics", (_req, res) => {
  res.json(analytics);
});

app.get("/", (_req, res) => {
  res.json({
    service: "LADI Backend",
    version: "0.2.0",
    phase: "Phase 2 build",
    endpoints: [
      "/api/health",
      "/api/projects",
      "/api/projects/:id",
      "/api/alerts",
      "/api/analytics",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`[LADI Backend] listening on http://localhost:${PORT}`);
});
