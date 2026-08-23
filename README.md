# LADI Portal — Land Acquisition Delay Intelligence

**Predictive Analytics System for Early Detection of Land Acquisition Delays**

- Problem Statement ID: 26017
- Organization: Ministry of Rural Development
- Department: Department of Land Resources (DoLR)

> Predictive monitoring and early warning system for infrastructure projects.

---

## Phase 1 Scope

This is a **Phase 1 prototype**: frontend dashboard architecture, navigation,
mock data, responsive layout, and a minimal backend health endpoint.

Not yet implemented (by design): machine learning models, database integration,
authentication, real government API integration.

## Tech Stack

| Layer    | Technologies                                        |
| -------- | --------------------------------------------------- |
| Frontend | React 18, Vite, React Router, Recharts, Lucide React |
| Backend  | Node.js, Express, CORS                               |

## Folder Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── data/         # Mock data modules
│   │   ├── pages/        # Route pages
│   │   ├── layouts/      # MainLayout (sidebar + navbar + content)
│   │   ├── services/     # API service layer
│   │   ├── App.jsx       # Routes
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles / design system
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── data/             # Reserved for future datasets
│   ├── server.js         # Express server (GET /api/health)
│   ├── package.json
│   └── .env.example
└── README.md
```

## Getting Started

### 1. Backend

```bash
cd backend
npm install
npm start          # http://localhost:5050
```

Health check: <http://localhost:5050/api/health>

```json
{
  "status": "ok",
  "service": "LADI Backend",
  "timestamp": "2026-08-23T04:00:00.000Z"
}
```

Optional: copy `.env.example` to `.env` to override `PORT`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The Vite dev server proxies `/api/*` to the backend at `http://localhost:5050`.
If the backend is offline, the UI shows **API Offline** and keeps working with
mock data.

### 3. Production build

```bash
cd frontend
npm run build      # outputs to dist/
npm run preview    # optional: serve the production build locally
```

## Routes

| Route           | Page                                            |
| --------------- | ----------------------------------------------- |
| `/dashboard`    | Fully implemented intelligence dashboard        |
| `/projects`     | Project register (Phase 1 module)               |
| `/risk-analysis`| Risk analysis workspace (Phase 1 module)        |
| `/map`          | Geographic risk map (Phase 1 module)            |
| `/alerts`       | Early-warning alert center                      |
| `/analytics`    | Deep-dive analytics (Phase 1 module)            |
| `/settings`     | System settings (Phase 1 module)                |

## API Endpoints

| Method | Path                 | Description                                    |
| ------ | -------------------- | ---------------------------------------------- |
| GET    | `/api/health`        | Service health + server timestamp              |
| GET    | `/api/projects`      | Mock project register (`?state=&risk=&q=`)     |
| GET    | `/api/projects/:id`  | Single mock project (404 if unknown)           |
| GET    | `/api/alerts`        | Mock early-warning alerts                      |
| GET    | `/api/analytics`     | Mock portfolio aggregates                      |

## Notes

- All project records, alerts, and KPI values are **mock data** for
  demonstration only (`frontend/src/data/`).
- Version label: `V0.1.0 · PHASE 1 BUILD`.
