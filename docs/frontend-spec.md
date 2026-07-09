# Frontend Specification

English-language reference for building the CHN web client on top of the procurement & logistics backend.

**Related documents**

| Document | Audience |
|----------|----------|
| [Product overview](./product-overview.md) | End users, product, presentations |
| [Developer guide](./developer-guide.md) | Frontend contributors |
| [API integration](./api-integration.md) | HTTP contracts and codegen |
| [API reference](./api-reference.md) | Endpoint lookup |
| [Implementation plan](./implementation-plan.md) | Phased delivery roadmap |

---

## 1. Product summary

CHN is a **multi-tenant B2B platform** for procurement, finance, and logistics.

A **company** is neutral: it can act as a **buyer**, a **supplier**, or both in different workflows. Users belong to one or more companies; the client must support **active company switching**.

The main business chain:

```text
Material Request → Supplier Quotes → Purchase Selection → Invoice → Payment
                                                              ↓
                                                    Shipping Invoice → Consolidation
```

**Traceability** is a first-class feature: every line item shares a `lineageId` from the original request line through quotes, selection, invoice, and shipment. The UI should expose this chain (trace view, document links).

---

## 2. API fundamentals

See [API integration](./api-integration.md) for full detail. Key points:

| Item | Value |
|------|-------|
| API prefix | `/api/v1` |
| Auth header | `Authorization: Bearer <accessToken>` |
| Company context | `X-Company-Id: <uuid>` |
| Money / quantities | Decimal **strings**, never JS `number` |
| Errors | `{ error: { code, message, details? } }` |
| List pagination | `limit` / `offset` (default limit 20) |
| Comments / notifications | Cursor pagination |

---

## 3. Authentication and session

### Flow

```text
Register → POST /auth/register (no tokens)
Login    → POST /auth/login → { user, accessToken, refreshToken }
Me       → GET  /auth/me → user + memberships[].effectivePermissions
Refresh  → POST /auth/refresh on 401 (rotate both tokens)
Logout   → POST /auth/logout + { refreshToken } → 204
```

### Frontend session model

1. Store `accessToken`, `refreshToken`, and cache `user` from `/auth/me`.
2. Persist selected **active company id** (localStorage / Redux).
3. On app load: refresh token if needed → fetch `/auth/me` → validate active company is still in memberships.
4. Attach `Authorization` + `X-Company-Id` on every company-scoped call.

### Pending invitation

If `membership.status === "INVITED"`, show accept flow:

```http
POST /api/v1/companies/:companyId/members/accept
Authorization: Bearer <accessToken>
```

(No `X-Company-Id` required.)

---

## 4. Authorization and UI gating

### Roles (presets only — do not use for authorization)

| Role | Typical UI areas |
|------|------------------|
| `OWNER` | Everything + member permissions |
| `ADMIN` | Broad ops; no `manageMemberPermissions` |
| `PROCUREMENT` | Requests, quotes, selections, invoices, payments |
| `LOGISTICS` | Shipping, consolidations |
| `ACCOUNTANT` | Payments; can **confirm** payments (`confirmPayments`) |
| `WAREHOUSE` | Shipping + consolidations (read-heavy) |
| `VIEWER` | Read-only across modules |

`OWNER` cannot be assigned via API. Role changes reset custom permission overrides to `null`.

### Permission codes

Gate buttons, routes, and forms with `effectivePermissions` from `/auth/me` (for active company), **not role names alone**.

| Permission | UI capability |
|------------|---------------|
| `manageMembers` | Invite members, change roles |
| `manageMemberPermissions` | Owner-only permission overrides |
| `manageCompany` | Company settings |
| `viewMembers` | Member list |
| `viewPartners` / `managePartners` | Partner directory and invites |
| `viewProducts` / `manageProducts` | Product catalog |
| `viewRequests` / `manageRequests` | Material requests, CSV import |
| `viewQuotes` / `manageQuotes` | Quotes (supplier side) |
| `viewSelections` / `manageSelections` | Purchase selections |
| `viewInvoices` / `manageInvoices` | Invoices |
| `viewPayments` / `managePayments` | Register and upload payments |
| `confirmPayments` | Accountant confirm/reject |
| `viewShippingInvoices` / `manageShippingInvoices` | Shipping documents |
| `viewConsolidations` / `manageConsolidations` | Consolidations |
| `viewNotifications` | Notification center |
| `viewTrace` | Traceability views |
| `manageIntegrations` | API keys, webhooks, mappings (admin settings) |

Server returns `403` + `INSUFFICIENT_PERMISSIONS` if action is denied — hide UI where possible, but always handle API errors.

### Bilateral document visibility

Many documents store both `buyerCompanyId` and `supplierCompanyId`. List endpoints support:

- `direction=inbound` — active company is the counterparty receiving the flow
- `direction=outbound` — documents created/sent by active company

Use separate navigation or tabs: e.g. “Our invoices” vs “Invoices from suppliers”.

---

## 5. Core user journeys

### 5.1 Onboarding

1. Register → Login
2. Create company (`POST /companies`) or accept invitation
3. Invite colleagues (owner/admin)
4. Connect partners (`POST .../partners/invite`)
5. Select active company in shell/header

### 5.2 Buyer: request to delivery

| Step | Actor | Key actions |
|------|-------|-------------|
| 1 | Procurement | Create request (draft), add lines, submit |
| 2 | Procurement | Distribute to supplier companies |
| 3 | Supplier | View inbound request, create & submit quote |
| 4 | Buyer | Quote comparison view, create selection, add lines, confirm |
| 5 | Supplier | Create invoice from billable lines, issue |
| 6 | Buyer | Register payment, upload proof |
| 7 | Accountant | Confirm or reject payment |
| 8 | Supplier | Create shipping invoice, issue, mark in transit / delivered |
| 9 | Buyer | Create consolidation, add shipping invoices, plan transit |

The same company may appear on both sides in different tabs.

### 5.3 Collaboration

- Comments on any document type
- Activity feed merges system events + comments
- Notifications with unread badge and mark-read

### 5.4 Traceability

- Search traceable lines
- Line detail: full chain from request to consolidation
- Document relationship graph from any document page

---

## 6. Document statuses and allowed actions

Use status to enable/disable actions. Server enforces transitions; UI should mirror expected flows.

### Material Request

| Status | Meaning | Typical actions |
|--------|---------|-----------------|
| `DRAFT` | Editable | Edit header/lines, submit |
| `SUBMITTED` | Sent internally | Distribute to suppliers |
| `QUOTING` | With suppliers | View quotes, selection |
| `PARTIALLY_ORDERED` | Some lines ordered | Continue selection/invoicing |
| `ORDERED` | All lines covered | Close when done |
| `CLOSED` | Finished | Read-only |

**Actions:** `POST .../submit`, `POST .../distribute` `{ supplierCompanyIds: [] }`  
Edit/delete lines only in `DRAFT`.

### Supplier Quote

| Status | Actions |
|--------|---------|
| `DRAFT` | Edit, add/remove lines, submit |
| `SUBMITTED` | Read-only for supplier; buyer compares |
| `PARTIALLY_ACCEPTED` / `ACCEPTED` / `REJECTED` / `EXPIRED` | Driven by selection workflow |

### Purchase Selection

| Status | Actions |
|--------|---------|
| `DRAFT` | Add/update/remove lines, confirm, cancel |
| `CONFIRMED` | Invoice creation enabled |
| `CANCELLED` | Terminal |

### Invoice

| Status | Actions |
|--------|---------|
| `DRAFT` | Edit lines, issue |
| `ISSUED` | Payments allowed |
| `PARTIALLY_PAID` / `PAID` | More payments; supplier may confirm |
| `CONFIRMED` | Terminal (fully reconciled) |

List filter: `direction=inbound|outbound`.

### Payment

| Status | Actions |
|--------|---------|
| `PENDING` | Upload file |
| `UPLOADED` | Accountant confirm/reject |
| `CONFIRMED` / `REJECTED` | Terminal |

### Shipping Invoice

| Status | Actions |
|--------|---------|
| `DRAFT` | Edit, issue |
| `ISSUED` | Mark in transit |
| `IN_TRANSIT` | Mark delivered |
| `DELIVERED` | Terminal; eligible for consolidation |

### Consolidation

| Status | Actions |
|--------|---------|
| `DRAFT` | Edit, add/remove shipping invoices, plan |
| `PLANNED` | Mark in transit |
| `IN_TRANSIT` | Mark at customs |
| `CUSTOMS` | Mark delivered |
| `DELIVERED` | Terminal |

Transport modes: `ROAD`, `AIR`, `RAIL`, `SEA`.

---

## 7. Entity relationships

```text
Company ──< CompanyMember >── User
Company ──< TradingPartner >── Company (partner link)

Company ──< Product
Company ──< MaterialRequest ──< RequestLine  (lineageId born here)
         │
         ├── distributed to ──> SupplierQuote ──< QuoteLine
         │
         └── PurchaseSelection ──< SelectionLine ──> QuoteLine
                    │
                    └──> Invoice ──< InvoiceLine ──< Payment
                              │
                              └──> ShippingInvoice ──< ShippingLine
                                        │
                                        └──> Consolidation (whole invoice added)

Comment, DocumentEvent, Notification ── attached to DocumentType + documentId
```

**Lineage rule:** When displaying a line anywhere, keep `lineageId` — link to trace view:

```http
GET /api/v1/companies/:companyId/trace/:lineageId
```

**Consolidation rule:** Link is at **shipping invoice** level, not individual line.

---

## 8. Information architecture

```text
/login, /register
/onboarding
/app
├── Company switcher + notification bell
└── Nav (permission-filtered)
    ├── Procurement
    │   ├── Requests (outbound)
    │   ├── Inbound requests (supplier)
    │   ├── New request / Import CSV
    │   └── Products
    ├── Quotes
    │   ├── My quotes
    │   └── Comparison (from request detail)
    ├── Selections
    ├── Finance
    │   ├── Invoices (inbound / outbound)
    │   └── Payments
    ├── Logistics
    │   ├── Shipping invoices
    │   └── Consolidations
    ├── Trace
    ├── Partners
    └── Team settings
```

---

## 9. UI patterns

### Document detail layout

Reuse across request, quote, selection, invoice, payment, shipping, consolidation:

1. **Header** — status badge, counterparty, primary status actions
2. **Lines table** — MRT with `lineageId` link on each row
3. **Tabs** — Details | Comments | Activity | Trace | Related

### Shared components (target)

| Component | Purpose |
|-----------|---------|
| `DecimalInput` / `DecimalDisplay` | Money and quantity fields |
| `StatusBadge` | Document status with i18n label |
| `PermissionGate` | Conditional render by permission |
| `LineageLink` | Navigate to `/app/trace/:lineageId` |
| `ApiErrorAlert` | Map `error.code` to i18n |
| `PaginatedTable` | Offset pagination wrapper for MRT |

### Cross-cutting client rules

**HTTP**

- Base URL: `/api/v1` (Vite proxy in dev)
- On `401`: refresh once; on failure → logout and redirect to `/login`
- Map `error.code` to i18n keys

**Decimals**

- Validate client-side with `/^\d+(\.\d{1,4})?$/` before submit
- Format display with `decimal.js`; send API values as strings

**Polling**

- CSV import job: poll every 1–2 s until `PREVIEW_READY` or `FAILED`
- Notification unread count: poll on interval and window focus

**Stale actions**

- Gate buttons by document status + permission
- Handle `error.code` when server rejects (e.g. concurrent status change)

---

## 10. Document types for communication API

`documentType` enum values:

`MATERIAL_REQUEST` | `SUPPLIER_QUOTE` | `PURCHASE_SELECTION` | `INVOICE` | `PAYMENT` | `SHIPPING_INVOICE` | `CONSOLIDATION`

Used for comments, activity, notifications, and relationship graph endpoints.

---

## 11. Out of MVP scope

- Integration admin UI (API keys, webhooks, mappings) — Phase 12
- Analytics dashboards
- WebSocket / live updates
- Warehouse receiving screens
- Mobile-native clients

---

## 12. Testing expectations

| Layer | Tool | Focus |
|-------|------|-------|
| Unit / component | Vitest + Testing Library | Forms, decimal helpers, permission gates |
| E2E | Playwright | Login → create request → quote → selection (critical paths) |

Test happy paths plus typical errors: no permission, wrong status, wrong company.

---

## 13. Keeping the spec current

When backend API or UX decisions change:

1. Update this document and [API reference](./api-reference.md)
2. Sync `openapi/api-docs.json` and run `npm run codegen`
3. Update [implementation plan](./implementation-plan.md) phase status

The authoritative field-level schema is always OpenAPI (`openapi/api-docs.json` or live `/docs/json`).
