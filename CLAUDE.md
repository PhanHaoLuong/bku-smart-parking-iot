# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Run everything (MongoDB via Docker + backend :5000 + frontend :5173)
make dev

# Individual services
make db          # MongoDB on 27017
make be          # Express backend on :5000
make fe          # Vite frontend on :5173

# Or via npm
npm run dev               # backend + frontend concurrently
npm run dev:backend       # backend only (nodemon)
npm run dev:frontend      # frontend only

npm run build             # build frontend
npm run start             # backend production mode

# Frontend linting
npm run lint --prefix frontend
```

No test suite is configured yet (`npm test` echoes a placeholder).

## Architecture

Monorepo: **Express 5 + Mongoose** backend, **React 19 + Vite 8** frontend, **MongoDB 7** via Docker.

### Backend (`backend/src/`)

Layered structure: **routes → controllers → utils → models**.

- `server.js` — entry point, mounts all routes under `/apiv1/*`, seeds demo data on startup
- `config/db.js` — singleton MongoDB connection via Mongoose
- `models/` — User, Event, ParkingSession, SlotState
- `routes/` + `controllers/` — four route groups:
  - `/apiv1/auth` — signup/login/logout/user-info (simple token auth, NOT JWT)
  - `/apiv1/iot/events` — POST to ingest IoT events, GET to poll latest
  - `/apiv1/monitoring` — summary/slots/active-vehicles for staff dashboard
  - `/apiv1/parking-history` — parking session history by user or all
- `utils/` — business logic proper (controllers are thin):
  - `event.util.js` — **event ingestion with CQRS projections**: raw events written to Event collection, then projected into SlotState and ParkingSession aggregates via `applySlotProjection()`/`applyParkingSessionProjection()`
  - `monitoring.util.js` — aggregation queries for the operator dashboard
  - `eventvalidation.util.js` — IoT event batch validation
  - `seed.util.js` — generates 40 slots across 2 lots (lot-1, lot-3) with realistic parking timeline data, 6 demo users, mix of occupied/free/expired sessions
- `middlewares/protectedroute.js` — placeholder, incorrectly references `localStorage` server-side

**Auth model**: Token is the string `${userId}-${role}-token` stored in an in-memory `Set` on the backend, in `localStorage` on the frontend. Roles: `admin`, `operator`, `learner`, `faculty`. No RBAC enforcement exists yet — parking history route trusts the client to send the right query.

### Frontend (`frontend/src/`)

- Vite proxies `/apiv1` to `http://backend:5000` (for Docker); local dev works via direct calls to `:5000`
- `AuthContext` — React Context that reads the token from localStorage, exposes `{ isAuthenticated, role, userId, handleLogin, handleLogout }`
- Pages: `AuthPage` (toggles LoginForm/SignupForm), `DashboardPage` (navigation hub), `StaffDashboardPage` (polls `/apiv1/monitoring/summary` every 20s), `ParkingHistoryPage`, `InfoPage`
- React Router 7 with routes: `/auth`, `/dashboard`, `/parking-history`, `/info`, `/staff-dashboard`

### Docker

`docker-compose.yml` defines `mongo`, `backend`, and `frontend` services. `make dev` only starts mongo; the full compose stack is for production-like deployment.

## Key Design Notes

- **Event sourcing pattern**: IoT events are the source of truth; SlotState and ParkingSession are denormalized projections. This is where new IoT event types or slot status logic should be added.
- **Seeding is destructive**: `seedDemoData()` deletes all Event/SlotState/ParkingSession data then recreates it. It runs on every server start.
- **JWT is intentionally deferred** per project scope — current auth is a placeholder.
- External integrations (HCMUT_SSO, BKPay) are noted in `docs/update.md` but not implemented; all data is mocked/seeded.
