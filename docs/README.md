# CHN Frontend Documentation

English-language documentation for the CHN web client. These docs are derived from the project specifications in `.cursor/` and reflect the current `chn_frontend` codebase.

## Start here

| Audience | Read first |
|----------|------------|
| New developers | [Developer guide](./developer-guide.md) → [API integration](./api-integration.md) |
| Product / stakeholders | [Product overview](./product-overview.md) |
| UI / feature work | [Frontend specification](./frontend-spec.md) → [Implementation plan](./implementation-plan.md) |
| API lookup | [API reference](./api-reference.md) |

## Documents

### [Product overview](./product-overview.md)

Non-technical description of CHN: target users, business workflows (request → delivery), roles, traceability, and key benefits. Suitable for presentations and onboarding new team members.

### [Developer guide](./developer-guide.md)

How to run and contribute to the frontend: stack, folder layout, state management, auth flow, permissions, coding conventions, and common tasks.

### [Frontend specification](./frontend-spec.md)

Detailed client integration guide: API conventions, authentication, authorization, user journeys, document statuses, entity relationships, and UI patterns (document detail layout, traceability, polling).

### [API integration](./api-integration.md)

Practical guide for connecting the SPA to the CHN backend: base URL, required headers, token refresh, error handling, decimal strings, pagination, and Orval codegen workflow.

### [API reference](./api-reference.md)

Concise REST endpoint catalog grouped by domain (auth, companies, procurement, finance, logistics, communication, trace, integration).

### [Implementation plan](./implementation-plan.md)

Phased roadmap aligned with the backend release plan. Includes stack decisions, folder structure targets, cross-cutting rules, and deliverables per phase.

## Related artifacts

| Location | Purpose |
|----------|---------|
| `openapi/api-docs.json` | OpenAPI 3.1 snapshot for Orval codegen (108 paths) |
| `.cursor/` | Agent handoff specs and planning notes (source material for this docs folder) |
| Backend `/docs` | Live Swagger UI when the API server runs |

## Keeping docs up to date

When the API or architecture changes:

1. Sync `openapi/api-docs.json` from the backend and run `npm run codegen`.
2. Update [API reference](./api-reference.md) and [API integration](./api-integration.md) if endpoints or contracts change.
3. Update [Implementation plan](./implementation-plan.md) phase status as features ship.
4. Update [Developer guide](./developer-guide.md) for structural or convention changes.
