# Implementation Plan

Phased roadmap for the CHN frontend SPA, aligned with backend release phases.

**Related:** [Frontend specification](./frontend-spec.md) · [Developer guide](./developer-guide.md)

---

## Purpose

Deliver a usable MVP that mirrors all backend document flows:

```text
Material Request → Supplier Quotes → Purchase Selection → Invoice → Payment
                                                              ↓
                                                    Shipping Invoice → Consolidation
```

Each phase ends with a working, testable UI slice.

---

## Current progress

| Phase | Name                | Status      |
| ----- | ------------------- | ----------- |
| 0     | Foundation          | **Done**    |
| 1     | Identity & shell    | **Done**    |
| 2     | Partner network     | **Done**    |
| 3     | Products & requests | **Done**    |
| 4     | CSV request import  | **Done**    |
| 5–13  | See below           | Not started |

---

## Core goals

- Keep API types in sync with OpenAPI (`openapi/api-docs.json`)
- Treat money and quantities as **decimal strings** in API payloads
- Reuse a single **document detail layout** across entity types
- Gate actions by **document status + permission**, handle stale actions via `error.code`
- Support polling where the backend has no websockets (imports, notifications)

## Out of MVP scope

- Integration admin UI (API keys, webhooks, mappings)
- Analytics dashboards
- WebSocket / live updates
- Warehouse receiving screens
- Mobile-native clients

---

## Stack

| Area      | Choice                                |
| --------- | ------------------------------------- |
| UI        | React 19, MUI 6, material-react-table |
| State     | Redux Toolkit, RTK Query              |
| Routing   | React Router 7                        |
| Forms     | React Hook Form, Zod                  |
| Build     | Vite 6, TypeScript                    |
| API types | Orval                                 |
| i18n      | react-i18next (English first)         |
| Money     | decimal.js                            |

---

## Target folder structure

```text
src/
├── api/           # baseApi, generated/, endpoints/
├── app/           # store, router, theme, i18n
├── features/      # pages by domain
├── layouts/       # appLayout, authLayout, pageShell, documentDetailLayout
├── components/    # shared UI
├── lib/           # decimal, authStorage, permissions, navConfig
├── routes/        # guards, AuthBootstrap
└── types/         # baseline API types
```

---

## Cross-cutting rules

| Topic       | Rule                                                |
| ----------- | --------------------------------------------------- |
| HTTP        | `Authorization` + `X-Company-Id` on company routes  |
| Auth        | Refresh on 401 once; logout on failure              |
| Permissions | Use `effectivePermissions`, not role names          |
| Pagination  | Offset for lists; cursor for notifications/comments |
| Decimals    | Strings in API; `decimal.js` for display            |
| Polling     | Import jobs 1–2 s; notifications on focus/interval  |

---

## API baseline (OpenAPI 1.0)

The current `openapi/api-docs.json` defines **108 paths**. Notable auth and membership changes vs earlier specs:

- Email verification and password reset endpoints under `/auth/*`
- `user.emailVerified` on user objects
- Pending member invites are `.../members/invitations`, not `INVITED` memberships
- Register accepts `inviteToken`; response may include `acceptedMembership`

See [API reference](./api-reference.md) and [API integration](./api-integration.md) for details.

## Phases

### Phase 0. Foundation — Done

**Delivered:**

- Vite + React + TypeScript scaffold
- RTK, MUI, RHF, Zod, decimal.js, i18next, notistack, SASS
- Vite proxy `/api` → `localhost:3000`
- Path alias `@/`
- Orval codegen → `src/api/generated/`
- Baseline `src/types/api.ts`, `lib/decimal.ts`, `lib/authStorage.ts`

### Phase 1. Identity, companies, memberships — Done

**Delivered:**

- `api/baseApi.ts` with `baseQueryWithReauth`
- `authSlice`: tokens, `activeCompanyId`, persistence
- `authApi`: register, login, logout, me, refresh, verify-email, resend-verification, forgot/reset password
- `companiesApi`: list, create, get, accept invite
- `membersApi`: list members, invite, list/revoke invitations, remove member, update role
- Pages: `/login`, `/register`, `/register/success`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-email-prompt`, `/onboarding`
- `TeamSettingsPage` at `/app/settings/team`
- Register with `inviteToken` and `acceptedMembership` handling
- `emailVerified` gating on protected routes
- Onboarding uses `user.pendingInvitations` from `/auth/me`
- `AppLayout`, `CompanySwitcher`, `PermissionGate`, `navConfig`
- `ApiErrorAlert` with i18n error codes

**Routes:** `/login`, `/register`, `/register/success`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-email-prompt`, `/onboarding`, `/app`, `/app/settings/team`

### Phase 2. Partner network

**Backend:** `/partners/*`

**Tasks:**

- `partnersApi`: list, inbound/outbound, directory search, invite, accept/reject
- `/app/partners` with tabs: Inbound | Outbound | Directory
- Invite dialog (search by `q` or `taxId`)
- Partner status badges

**Deliverable:** Send and accept partner invitations.

### Phase 3. Product catalog and request creation

**Backend:** `/products/*`, `/requests/*`

**Tasks:**

- `productsApi`, `requestsApi`
- `/app/products`: MRT list + create/edit dialog
- `/app/requests`: paginated list with status filters
- `/app/requests/new`, `/app/requests/:id`
- `RequestLinesTable` with inline edit in `DRAFT`
- `DecimalInput`, `DecimalDisplay`, `StatusBadge`
- `RequestStatusActions`: submit
- Start `DocumentDetailLayout` (header + lines)

**Deliverable:** Create request, manage lines, submit.

### Phase 4. CSV request import

**Backend:** `/imports/*` (worker required)

**Tasks:**

- `importsApi`: multipart upload, get job, confirm
- `/app/requests/import` with dropzone
- Poll job every 1–2 s
- Preview table with validation errors
- Confirm → redirect to request detail

**Deliverable:** Upload CSV, review preview, confirm import.

### Phase 5. Quote submission and comparison

**Backend:** `/requests/inbound`, `/quotes/*`, comparison endpoint

**Tasks:**

- `quotesApi`
- `/app/requests/inbound` (supplier view)
- `/app/quotes`, `/app/quotes/:id`
- `/app/requests/:id/compare` — comparison matrix (MRT)
- Distribute action on request detail
- `LineageLink` on line rows

**Deliverable:** Supplier submits quote; buyer views comparison matrix.

### Phase 6. Position selection

**Backend:** `/selections/*`

**Tasks:**

- `selectionsApi`
- `/app/selections/:id`: pick quote lines and quantities
- Confirm / cancel actions
- Navigation: request → selection → invoice
- RTK Query cache invalidation

**Deliverable:** Buyer confirms selection across multiple suppliers.

### Phase 7. Invoices and payments

**Backend:** `/invoices/*`, `/payments/*`

**Tasks:**

- `invoicesApi`, `paymentsApi`
- `/app/invoices` with inbound/outbound tabs
- `/app/invoices/:id`: issue, confirm
- `/app/payments`, `/app/payments/:id`
- Multipart proof upload; accountant confirm/reject
- Display amounts via `decimal.js`

**Deliverable:** Issue invoice, register payment, confirm/reject.

### Phase 8. Shipping invoices

**Backend:** `/shipping-invoices/*`, shippable-lines

**Tasks:**

- `shippingApi`
- `/app/shipping-invoices` with inbound/outbound tabs
- Status: issue → in transit → delivered
- Pick shippable lines from parent invoice

**Deliverable:** Supplier creates shipping invoice with lineage-linked lines.

### Phase 9. Consolidations

**Backend:** `/consolidations/*`, consolidatable list

**Tasks:**

- `consolidationsApi`
- `/app/consolidations`, `/app/consolidations/:id`
- Add/remove shipping invoices; `transportMode` select
- Status: plan → in transit → customs → delivered

**Deliverable:** Group shipping invoices into consolidation.

### Phase 10. Comments and notifications

**Backend:** comments, activity, notifications

**Tasks:**

- `commentsApi`, `notificationsApi`
- Complete `DocumentDetailLayout` tabs: Comments, Activity
- `NotificationBell` with unread count polling
- Notifications list; deep links to documents
- Mark read / mark all read

**Deliverable:** Comments on all document types; notification navigation.

### Phase 11. Traceability and audit views

**Backend:** `/trace/*`, relationships

**Tasks:**

- `traceApi`
- `/app/trace`: search
- `/app/trace/:lineageId`: timeline
- Related and Trace tabs on document detail
- `LineageLink` on every line table

**Deliverable:** Full chain from request through consolidation.

### Phase 12. External integrations (post-MVP)

**Backend:** `/integration/*`

**Status:** Defer after MVP

**Tasks:** API keys, mappings, webhooks, export jobs UI behind `manageIntegrations`.

### Phase 13. Platform UX

**Tasks:**

- Language switcher (additional locales)
- Dark mode / theme toggle
- Responsive mobile layout
- Localized catalog names (coordinate with backend `Accept-Language`)

---

## Suggested build order per phase

1. RTK Query endpoints + tag types
2. List page with MRT pagination
3. Detail page with status actions
4. Forms (RHF + Zod)
5. Permission and status gating
6. Navigation links to related documents
7. Manual test against running backend
8. Add or extend automated tests for new logic (unit/component)

---

## Testing

**Status:** Infrastructure in place (Vitest + Testing Library). E2E (Playwright) planned before release.

| Layer            | Tool                     | Status                              |
| ---------------- | ------------------------ | ----------------------------------- |
| Unit / component | Vitest + Testing Library | **Done** — Phase 1 baseline         |
| E2E              | Playwright               | Not started (pre-release milestone) |

**Commands:**

```bash
npm run test          # single run
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

**Phase 1 coverage:**

- `lib/permissions.ts` — permission helpers, email verification, memberships
- `routes/ProtectedRoute.tsx` — auth, email, onboarding redirects
- `hooks/useLogout.ts` — logout flow
- Auth pages — `LoginPage`, `ResetPasswordPage` form validation
- `TeamSettingsPage` — render with mocked RTK Query

Add tests alongside each new phase; expand E2E when request → quote → selection flows exist.

---

## Milestone checklist before release

- [ ] All MVP phases (0–11) complete
- [ ] Critical E2E path: login → request → quote → selection → invoice → payment
- [ ] `openapi/api-docs.json` synced with production API version
- [ ] Error codes mapped in i18n
- [ ] No `number` types sent for money/qty in API payloads
- [ ] Company switcher updates `X-Company-Id` and refetches permissions

---

## Related documents

- [Frontend specification](./frontend-spec.md) — UX flows and document statuses
- [API reference](./api-reference.md) — endpoint catalog
- `.cursor/FRONTEND_AGENT_HANDOFF.md` — detailed agent handoff with TypeScript baselines
