const express = require("express");
const cors = require("cors");

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

app.get("/", (_req, res) => {
  res.json({
    service: "LADI Backend",
    version: "0.1.0",
    phase: "Phase 1 build",
    endpoints: ["/api/health"],
  });
});

app.listen(PORT, () => {
  console.log(`[LADI Backend] listening on http://localhost:${PORT}`);
});
