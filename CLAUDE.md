# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Project**: BKU Smart Parking IoT — Monorepo for a university parking management system with IoT integration, role-based access, and billing features.

## Common Commands

```bash
# Start everything (MongoDB + backend + frontend) - all via Docker
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Or run locally without Docker
npm run dev               # backend + frontend concurrently
npm run dev:backend       # backend only (nodemon)
npm run dev:frontend      # frontend only

npm run build             # build frontend
npm run start             # backend production mode
```

**Ports when running with docker compose:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5001 (mapped to container port 5000)
- MongoDB: localhost:27017

No test suite is configured yet (`npm test` echoes a placeholder).

## Architecture

Monorepo: **Express 5 + Mongoose** backend, **React 19 + Vite 8** frontend, **MongoDB 7** via Docker.

### Backend (`backend/src/`)

Layered structure: **routes → controllers → utils → models**.

- `server.js` — entry point, mounts all routes under `/apiv1/*`, seeds demo data on startup
- `config/db.js` — singleton MongoDB connection via Mongoose
- `models/`: User, Event, ParkingSession, SlotState, AuditLog, Invoice, PricingPolicy, VisitorTransaction
- `routes/` + `controllers/` — five route groups:
  - `/apiv1/auth` — signup/login/logout/user-info (simple token auth, NOT JWT)
  - `/apiv1/iot` — POST/GET for IoT event ingestion
  - `/apiv1/monitoring` — summary/slots/active-vehicles for staff dashboard
  - `/apiv1/parking-history` — parking session history by user or all
  - `/apiv1/billing` — invoices, pricing policies, audit trails (Finance role)
- `utils/` — business logic proper (controllers are thin):
  - `event.util.js` — **event ingestion with CQRS projections**: raw events written to Event collection, then projected into SlotState and ParkingSession aggregates via `applySlotProjection()`/`applyParkingSessionProjection()`
  - `monitoring.util.js` — aggregation queries for the operator dashboard
  - `eventvalidation.util.js` — IoT event batch validation
  - `seed.util.js` — generates 40 slots across 2 lots (lot-1, lot-3) with realistic parking timeline data, 6 demo users, mix of occupied/free/expired sessions
  - `billing.util.js` — billing calculations, invoice generation, pricing policy evaluation
  - `auth.util.js`, `authSession.util.js` — authentication utilities
- `middlewares/`:
  - `protectedroute.js` — placeholder, incorrectly references `localStorage` server-side
  - `roleMiddleware.js` — RBAC enforcement for routes

**Auth model**: Token is the string `${userId}-${role}-token` stored in an in-memory `Set` on the backend, in localStorage on the frontend. Roles: `operator`, `learner`, `faculty`, `finance`. Role middleware exists for RBAC enforcement.

### Frontend (`frontend/src/`)

- Vite proxies `/apiv1` to `http://backend:5000` (for Docker); local dev works via direct calls to `:5000`
- `authStore.js` — Zustand store that manages auth state, reads token from localStorage
- React Router 7 with role-based pages:
  - Auth: `LoginPage`
  - Learner: `LearnerDashboardPage`
  - Finance: `FinanceDashboardPage`, `PricingConfigPage`, `InvoiceListPage`, `AuditTrailPage`
  - Staff/Operator: `StaffDashboardPage`
  - Shared: `DashboardPage`, `ParkingHistoryPage`, `InfoPage`

### Docker

`docker-compose.yml` defines `mongo`, `backend`, and `frontend` services. Run `docker compose up -d` to start all services.

## Key Design Notes

- **Event sourcing pattern**: IoT events are the source of truth; SlotState and ParkingSession are denormalized projections. This is where new IoT event types or slot status logic should be added.
- **Seeding is destructive**: `seedDemoData()` deletes all Event/SlotState/ParkingSession data then recreates it. It runs on every server start.
- **JWT is intentionally deferred** per project scope — current auth is a placeholder.
- External integrations (HCMUT_SSO, BKPay) are noted in `docs/update.md` but not implemented; all data is mocked/seeded.
- **Billing features**: Role `finance` has access to pricing configuration, invoice management, and audit trails. Pricing policies support per-vehicle-type rates and role-based discounts.

## Scope & Limitations

See `docs/update.md` for detailed scope notes — it lists what's implemented vs. what's missing from the `specs.pdf` requirements. Key items still pending: JWT authentication (deferred), external integrations (HCMUT_SSO, BKPay), real-time IoT via WebSocket/SSE, and automated tests.

## Documentation

- `docs/update.md` — Project scope, missing features vs. specs, billing service design notes
- `docs/specs.pdf` — Full specification document (reference only, not implemented)