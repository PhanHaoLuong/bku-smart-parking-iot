# BKU Smart Parking IoT

Initial full-stack foundation using Node.js + Express (backend) and React + Vite (frontend).

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. Install root tools:
   ```bash
   npm install
   ```
2. Backend dependencies (already inside backend):
   ```bash
   npm install --prefix backend
   ```
3. Frontend dependencies (already inside frontend):
   ```bash
   npm install --prefix frontend
   ```

## Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health endpoint: http://localhost:5000/api/health

## Available scripts

- `npm run dev` - run backend + frontend together
- `npm run dev:backend` - run only backend
- `npm run dev:frontend` - run only frontend
- `npm run build` - build frontend
- `npm run start` - run backend in production mode

## Backend environment

Copy `backend/.env.example` to `backend/.env` and adjust if needed.
