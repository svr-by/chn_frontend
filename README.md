# CHN Frontend

Web client for **CHN** — a multi-tenant B2B procurement and logistics platform. Companies manage the full document chain from material requests through quotes, purchase selections, invoices, payments, shipping, and consolidations.

## Features

- JWT authentication with token refresh and multi-company switching
- Permission-gated navigation based on `effectivePermissions` (not role names)
- End-to-end line-item traceability via `lineageId`
- Procurement, finance, and logistics workflows in a single SPA

## Tech stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| UI        | React 19, MUI 6, Emotion              |
| State     | Redux Toolkit, RTK Query              |
| Routing   | React Router 7                        |
| Forms     | React Hook Form, Zod                  |
| Build     | Vite 6, TypeScript                    |
| API types | Orval (from OpenAPI)                  |
| i18n      | react-i18next                         |
| Money/qty | decimal.js (API uses decimal strings) |

## Prerequisites

- **Node.js** 22+
- **CHN Backend** running locally on port `3000` ([`chn_backend`](https://github.com/your-org/chn_backend) — adjust URL as needed)
- Docker (for backend PostgreSQL/Redis if using the default backend setup)

## Quick start

```bash
# Install dependencies
npm install

# Start the dev server (proxies /api to localhost:3000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

Create a `.env` file in the project root (optional — defaults work with the Vite proxy):

```env
VITE_API_BASE_URL=/api/v1
```

### Regenerate API types

After updating the OpenAPI snapshot from the backend:

```bash
# Copy openapi/api-docs.json from chn_backend/.cursor/api-docs.json
npm run codegen
```

### Backend worker (CSV import)

CSV import confirmation requires the backend worker process:

```bash
cd chn_backend
npm run worker
```

Sync CSV preview works without the worker; creating a request from an uploaded file does not.

## Scripts

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start Vite dev server                         |
| `npm run build`   | Type-check and production build               |
| `npm run preview` | Preview production build                      |
| `npm run codegen` | Regenerate types from `openapi/api-docs.json` |

## Project structure

```text
src/
├── api/           # RTK Query base API, generated types, domain endpoints
├── app/           # Store, router, theme, i18n
├── components/    # Shared UI (CompanySwitcher, PermissionGate, …)
├── features/      # Route-level pages by domain
├── hooks/         # Typed Redux hooks
├── layouts/       # AuthLayout, AppLayout
├── lib/           # authStorage, decimal, navConfig, permissions
├── routes/        # Auth guards and bootstrap
├── store/         # Redux slices
├── styles/        # Global SCSS
└── types/         # Baseline TypeScript API types
```

## Documentation

Full documentation lives in [`docs/`](./docs/README.md):

| Document                                             | Description                                |
| ---------------------------------------------------- | ------------------------------------------ |
| [Product overview](./docs/product-overview.md)       | What CHN does — for users and stakeholders |
| [Developer guide](./docs/developer-guide.md)         | Local setup, architecture, conventions     |
| [Frontend specification](./docs/frontend-spec.md)    | UX flows, permissions, document statuses   |
| [API integration](./docs/api-integration.md)         | Auth, headers, errors, pagination          |
| [API reference](./docs/api-reference.md)             | REST endpoint catalog                      |
| [Implementation plan](./docs/implementation-plan.md) | Phased roadmap and current progress        |

## Current status

**Phases 0–4** are implemented for their scoped features: foundation, identity/auth, partners, product catalog, material requests, and **CSV request import** (`/app/requests/import`). See [implementation plan](./docs/implementation-plan.md).

## License

Private — internal use.
