# Developer Guide

Technical guide for contributors working on the CHN frontend (`chn_frontend`).

For product context see [product overview](./product-overview.md).  
For API contracts see [API integration](./api-integration.md) and [API reference](./api-reference.md).  
For the delivery roadmap see [implementation plan](./implementation-plan.md).  
For **Cursor agent rules** see [`.cursor/rules/`](../.cursor/rules/) and [`AGENTS.md`](../AGENTS.md) at the repo root.

---

## What this project is

**CHN Frontend** is a single-page application (SPA) that talks to the **CHN Backend** REST API (`chn_backend`). The backend is a Fastify + Prisma + PostgreSQL service; this repo contains only the web client.

The client must support:

- Multi-tenant **company switching** (`X-Company-Id` header)
- **Permission-gated** UI from `effectivePermissions` (never from role names alone)
- **Decimal strings** for money and quantities in API payloads
- **Lineage traceability** (`lineageId`) on every document line

---

## Tech stack

| Technology                | Role                                           |
| ------------------------- | ---------------------------------------------- |
| React 19                  | UI framework                                   |
| TypeScript                | Type safety (strict mode)                      |
| Vite 6                    | Dev server and build                           |
| Redux Toolkit + RTK Query | Client state and server cache                  |
| React Router 7            | Routing                                        |
| MUI 6 + Emotion           | Component library                              |
| material-react-table      | Data grids (planned for lists and line tables) |
| React Hook Form + Zod     | Forms and validation                           |
| decimal.js                | Safe arithmetic on API decimal strings         |
| Orval                     | OpenAPI → TypeScript types                     |
| react-i18next             | UI strings and error code mapping              |
| notistack                 | Toast notifications                            |
| SASS                      | Global layout styles                           |

---

## Local development

### Prerequisites

- Node.js 22+
- CHN Backend running on `http://127.0.0.1:3000`

### Setup

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api`, `/health`, and `/ready` to the backend (see `vite.config.ts`).

Optional `.env`:

```env
VITE_API_BASE_URL=/api/v1
```

### Backend quick start (separate repo)

```bash
docker compose up -d
npm install
npm run prisma:migrate && npm run prisma:generate
npm run dev          # API on :3000
npm run worker       # required for CSV import jobs
```

---

## Repository layout

```text
chn_frontend/
├── openapi/
│   └── api-docs.json          # OpenAPI snapshot (sync from backend)
├── src/
│   ├── main.tsx               # App entry
│   ├── api/
│   │   ├── baseApi.ts         # RTK Query + token refresh
│   │   ├── endpoints/         # injectEndpoints per domain
│   │   └── generated/         # Orval output (do not edit)
│   ├── app/
│   │   ├── store.ts           # Redux store
│   │   ├── router.tsx         # Route definitions
│   │   ├── theme.ts           # MUI theme
│   │   └── i18n.ts            # i18n setup
│   ├── components/            # Shared UI
│   ├── features/              # Pages by domain
│   ├── hooks/
│   ├── layouts/               # AuthLayout, AppLayout
│   ├── lib/                   # Utilities
│   ├── routes/                # Guards, AuthBootstrap
│   ├── store/slices/          # authSlice, etc.
│   ├── styles/
│   └── types/api.ts           # Aliases to generated + frontend helpers
├── orval.config.ts
├── vite.config.ts
└── docs/                      # This documentation
```

Path alias `@/` maps to `src/` (configured in `tsconfig` and `vite.config.ts`).

### Feature module layout

New and refactored features follow the structure in `src/features/quotes/`:

```text
features/<domain>/
├── pages/<pageGroup>/       # Page + colocated *.test.tsx
├── components/<group>/      # camelCase UI groups (no root barrel files)
├── hooks/                   # Domain hooks (RTK + snackbar flows)
└── lib/                     # Pure logic (filters, row builders)
```

Cross-feature helpers belong in `src/lib/` (e.g. `dateInput.ts`). Agent-enforced details: `.cursor/rules/feature-module-structure.mdc`.

---

## Architecture

```text
Route (features/*)
    ↓
RTK Query endpoint (api/endpoints/*)  ← tags/hooks; urls via generated getXxxUrl
    ↓
baseApi (fetchBaseQuery + reauth)
    ↓
CHN Backend /api/v1
```

### State management rules

| Concern                               | Where                                    |
| ------------------------------------- | ---------------------------------------- |
| Access/refresh tokens, active company | `authSlice` + `authStorage`              |
| User profile and memberships          | RTK Query cache (`/auth/me`)             |
| Lists and document details            | RTK Query cache (domain endpoints)       |
| UI-only state                         | Local component state or Redux if shared |

**Do not** duplicate server lists in Redux — use RTK Query tags for cache invalidation.

### Authentication flow

1. User logs in → store tokens; user includes `emailVerified`
2. Every company-scoped request sends `Authorization` + `X-Company-Id`
3. On `401`, `baseApi` calls `/auth/refresh` once and retries; on failure → `clearSession()`
4. `AuthBootstrap` runs refresh → `/auth/me` on app load
5. `ProtectedRoute` redirects unauthenticated users to `/login`
6. Users without a company go to `/onboarding`

**Email verification** (post-register): `POST /auth/verify-email`, `POST /auth/resend-verification`.

**Password reset**: `POST /auth/forgot-password`, `POST /auth/reset-password`.

**Member invitations**: pending invites live at `GET .../members/invitations` (not `INVITED` membership status). New users accept via `inviteToken` on register; existing users via `POST .../members/accept`.

### Permissions

Read `memberships[].effectivePermissions` for the **active company**. Use:

- `usePermissions()` hook
- `PermissionGate` component
- `navConfig` — each nav item declares a required `view*` permission

Never gate actions from `MemberRole` alone — roles are presets; owners can override permissions.

### API codegen

```bash
# 1. Copy latest spec from backend
#    chn_backend/.cursor/api-docs.json → openapi/api-docs.json

# 2. Regenerate models + URL helpers
npm run codegen
```

Generated files live in `src/api/generated/` (`models/` + `endpoints.ts` with `getXxxUrl` helpers). Add RTK Query endpoints manually in `src/api/endpoints/` via `baseApi.injectEndpoints()`, wiring `url` through those helpers (do not hardcode path strings). Keep query params on the RTK `params` field. The manual layer is for cache tags, hooks, and auth side-effects. `src/api/contract.smoke.test.ts` fails if RTK helpers drift from `openapi/api-docs.json`.

---

## Routing

| Path                                  | Access                  | Purpose                                              |
| ------------------------------------- | ----------------------- | ---------------------------------------------------- |
| `/login`, `/register`                 | Guest                   | Authentication (`register` supports `?inviteToken=`) |
| `/forgot-password`, `/reset-password` | Guest                   | Password reset flow                                  |
| `/verify-email`                       | Guest                   | Email verification from link                         |
| `/onboarding`                         | Authenticated           | Create or join a company                             |
| `/app`                                | Authenticated + company | Main shell                                           |
| `/app/settings/team`                  | `viewMembers`           | Members and pending invitations                      |
| `/app/*`                              | Permission-gated        | Domain modules (many are placeholders)               |

Stub routes for upcoming phases are generated from `navConfig` and render `PlaceholderPage`.

---

## Cross-cutting conventions

### Decimal values

API sends quantities and amounts as **strings** (e.g. `"10.5"`). Never use JavaScript `number` for API payloads.

- Validate before submit: `/^\d+(\.\d{1,4})?$/`
- Display and calculate with `decimal.js` (`src/lib/decimal.ts`)

### Errors

API errors use `{ error: { code, message, details? } }`. Map `error.code` to i18n keys in `ApiErrorAlert`.

### Document detail pattern (target)

Reuse across request, quote, selection, invoice, payment, shipping, consolidation:

1. Header — status, counterparty, primary actions
2. Lines table — with `lineageId` link per row
3. Tabs — Details | Comments | Activity | Trace | Related

### Polling (planned)

- CSV import jobs: poll every 1–2 s until `PREVIEW_READY` or `FAILED`
- Notification unread count: poll on interval and window focus

---

## Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Vite dev server with API proxy        |
| `npm run build`   | `tsc -b` + production bundle          |
| `npm run preview` | Serve production build locally        |
| `npm run codegen` | Regenerate Orval models + URL helpers |

---

## Adding a new feature module

1. Add RTK Query endpoints in `src/api/endpoints/<domain>Api.ts` using generated `getXxxUrl` helpers for paths
2. Register `tagTypes` in `baseApi` for cache invalidation
3. Create pages under `src/features/<domain>/`
4. Add routes in `src/app/router.tsx`
5. Add nav entry in `src/lib/navConfig.ts` with required permission
6. Gate actions with `PermissionGate` + document status checks

---

## Where to find examples

| Task                | Reference                                                          |
| ------------------- | ------------------------------------------------------------------ |
| Token refresh       | `src/api/baseApi.ts`                                               |
| Auth state          | `src/store/slices/authSlice.ts`                                    |
| Permission gating   | `src/components/PermissionGate.tsx`, `src/hooks/usePermissions.ts` |
| Company switcher    | `src/components/CompanySwitcher.tsx`                               |
| Route guards        | `src/routes/ProtectedRoute.tsx`, `src/routes/AuthBootstrap.tsx`    |
| API endpoints       | `src/api/endpoints/authApi.ts`, `companiesApi.ts`                  |
| API type aliases    | `src/types/api.ts`                                                 |
| Contract smoke test | `src/api/contract.smoke.test.ts`                                   |

---

## FAQ

**Why RTK Query instead of Axios?**  
`fetchBaseQuery` covers JSON, headers, and interceptors. Token refresh is implemented in `baseQueryWithReauth`.

**Where is the OpenAPI source of truth?**  
`openapi/api-docs.json` (snapshot). Live spec: `GET /docs/json` when the backend runs.

**Do I need the backend worker?**  
Only for CSV import, async export, and webhooks. Auth and CRUD work without it.

**How do I debug API calls?**  
Browser Network tab, backend Swagger UI at `http://localhost:3000/docs`, or RTK Query DevTools.

---

## Related documents

- [Frontend specification](./frontend-spec.md) — UX flows and document statuses
- [API integration](./api-integration.md) — headers, pagination, error codes
- [Implementation plan](./implementation-plan.md) — phased delivery roadmap
