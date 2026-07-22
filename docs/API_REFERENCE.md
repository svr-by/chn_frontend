# CHN API Reference

Concise REST API catalog for **CHN Procurement & Logistics** backend.

| Item | Value |
|------|-------|
| OpenAPI | 3.1 (live spec: `/docs`, JSON: `/docs/json`) |
| Base URL | `/api/v1` |
| Format | JSON (`application/json`) |
| Auth | Bearer JWT and/or `X-Company-Id` header |
| Company context | `X-Company-Id` = active session company; `:companyId` in path = resource scope; **both must match** on company-scoped routes |
| Errors | `{ "error": { "code", "message", "details?" } }` |

**Legend — Auth**

| Symbol | Meaning |
|--------|---------|
| — | Public |
| 🔑 | `Authorization: Bearer <token>` |
| 🏢 | JWT + `X-Company-Id: <uuid>` |
| 🔐 | JWT or API key (`Authorization: Bearer chn_live_…` or `X-Api-Key`) + company context |

Paths below omit the `/api/v1` prefix unless noted.

### Company context

Company-scoped routes use **two aligned identifiers**:

- **`X-Company-Id` header** — active company for the session (membership check and permissions).
- **`:companyId` path segment** — resource scope in the URL (REST hierarchy, shareable links).

Send the same UUID in both places. A mismatch returns `400` with code `COMPANY_ID_MISMATCH`.

Exception: `POST /companies/{companyId}/members/accept` requires only Bearer JWT; `companyId` comes from the path.

---

## System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Liveness check |
| `GET` | `/ready` | — | Readiness check (database) |

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Register a new user; optional `inviteToken` auto-accepts company invitation; sends verification email (`locale?`: `en` \| `ru`) |
| `POST` | `/auth/login` | — | Login; returns access & refresh tokens |
| `POST` | `/auth/refresh` | — | Refresh token pair |
| `POST` | `/auth/logout` | 🔑 | Revoke refresh token |
| `GET` | `/auth/me` | 🔑 | Current user, company memberships, and pending invitations |
| `POST` | `/auth/verify-email` | — | Confirm email with token from verification email |
| `POST` | `/auth/resend-verification` | 🔑 | Resend verification email (`locale?`) |
| `POST` | `/auth/forgot-password` | — | Request password reset email (`locale?`) |
| `POST` | `/auth/reset-password` | — | Reset password with token from email |

---

## Companies

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/companies` | 🔑 | Create a company (max **3** owned companies per user, including inactive) |
| `GET` | `/companies` | 🔑 | List companies for current user (paginated: `limit`, `offset`; includes `isActive`) |
| `GET` | `/companies/{companyId}` | 🏢 | Get company details (allowed when company is inactive) |
| `POST` | `/companies/{companyId}/deactivate` | 🏢 | Soft-delete: set `isActive=false` (OWNER only) |
| `POST` | `/companies/{companyId}/reactivate` | 🏢 | Restore: set `isActive=true` (OWNER only; allowed when inactive) |
| `GET` | `/companies/{companyId}/members` | 🏢 | List company members (paginated) |
| `GET` | `/companies/{companyId}/members/invitations` | 🏢 | List pending invitations (`MemberInvitation`, including expired; paginated) |
| `POST` | `/companies/{companyId}/members/invite` | 🏢 | Invite member by email (`locale?`; always creates `MemberInvitation`) |
| `DELETE` | `/companies/{companyId}/members/invitations/{invitationId}` | 🏢 | Revoke pending invitation |
| `POST` | `/companies/{companyId}/members/accept` | 🔑 | Accept pending invitation |
| `DELETE` | `/companies/{companyId}/members/{memberId}` | 🏢 | Remove active member (hard delete; not OWNER) |
| `PATCH` | `/companies/{companyId}/members/{memberId}` | 🏢 | Update member role and/or status |
| `PATCH` | `/companies/{companyId}/members/{memberId}/permissions` | 🏢 | Set permission grants/denies |

### Soft-delete (`isActive`)

- Deactivate / reactivate are **OWNER-only**. Responses: `{ company }` (full company object with `isActive`).
- While `isActive=false`, company-scoped routes return `403 COMPANY_INACTIVE`, except:
  - `GET /companies/{companyId}`
  - `POST /companies/{companyId}/reactivate`
- `GET /companies` and `GET /auth/me` still return the membership; company payloads include `isActive` so the client can hide inactive companies in the switcher.
- Memberships, documents, partners, and API keys are **not** deleted. API keys for an inactive company fail with `COMPANY_INACTIVE`. Accepting a member invite into an inactive company fails with `COMPANY_INACTIVE`.

### Create limit

- A user may **own** at most **3** companies (`POST /companies`). Count is by `OWNER` memberships; inactive companies still count.
- Over limit → `409 COMPANY_OWNERSHIP_LIMIT_REACHED`. Joining other companies as a non-owner member is unlimited.

---

## Partners

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/partners` | 🏢 | List active partner links |
| `GET` | `/companies/{companyId}/partners/invitations` | 🏢 | Pending invitations (`direction?=inbound\|outbound`) |
| `POST` | `/companies/{companyId}/partners/invite` | 🏢 | Invite by contact email (`email`, optional `companyId`) |
| `DELETE` | `/companies/{companyId}/partners/{linkId}` | 🏢 | Cancel outbound pending invitation |
| `POST` | `/companies/{companyId}/partners/{linkId}/accept` | 🏢 | Accept partner invitation |
| `POST` | `/companies/{companyId}/partners/{linkId}/reject` | 🏢 | Reject partner invitation |

---

## Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/products` | 🏢 | List products (paginated) |
| `POST` | `/companies/{companyId}/products` | 🏢 | Create product |
| `GET` | `/companies/{companyId}/products/{productId}` | 🏢 | Get product |
| `PATCH` | `/companies/{companyId}/products/{productId}` | 🏢 | Update product |
| `DELETE` | `/companies/{companyId}/products/{productId}` | 🏢 | Hard-delete product (`204`) |

Hard delete removes the catalog row. Linked `RequestLine.productId` values become `null` (`onDelete: SetNull`); the line keeps `description` and `attributes.importSku` (SKU snapshot from import / line sync). Partner mappings with `PRODUCT_SKU` for that product id are also removed. Requires `manageProducts`.

---

## Material requests

Header and lines are editable in **all** request statuses (including `CLOSED`). Hard-delete of the whole request remains `DRAFT` only. 1C upsert remains `DRAFT` only (`REQUEST_NOT_EDITABLE_FROM_1C`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/requests` | 🏢 | List material requests (`status?`, `productId?`) |
| `GET` | `/companies/{companyId}/request-lines` | 🏢 | List request lines across company (work-queue filters + pipeline links) |
| `POST` | `/companies/{companyId}/requests` | 🏢 | Create draft request (optionally with lines in one request) |
| `GET` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Get request with lines (includes cancelled lines; `cancelledAt`) |
| `PATCH` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Update request header and/or full-replace `lines` |
| `DELETE` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Delete draft request (`204`) |
| `POST` | `/companies/{companyId}/requests/{requestId}/lines` | 🏢 | Add request line |
| `PATCH` | `/companies/{companyId}/requests/{requestId}/lines/{lineId}` | 🏢 | Update request line (not cancelled) |
| `DELETE` | `/companies/{companyId}/requests/{requestId}/lines/{lineId}` | 🏢 | Remove or soft-cancel request line |
| `POST` | `/companies/{companyId}/requests/{requestId}/distribute` | 🏢 | Send / upsert request distributions to suppliers |
| `GET` | `/companies/{companyId}/requests/{requestId}/distributions` | 🏢 | List all supplier distributions for a request (buyer view) |
| `DELETE` | `/companies/{companyId}/requests/{requestId}/distributions/{distributionId}` | 🏢 | Remove a supplier distribution (`204`) |
| `GET` | `/companies/{companyId}/requests/inbound` | 🏢 | Inbound request summaries (supplier view) |
| `GET` | `/companies/{companyId}/requests/inbound/{requestId}` | 🏢 | Inbound request detail with assigned lines (supplier view) |
| `POST` | `/companies/{companyId}/requests/inbound/{requestId}/reject` | 🏢 | Supplier rejects inbound request distribution |
| `GET` | `/companies/{companyId}/request-lines/inbound` | 🏢 | Flat inbound request lines work-queue (supplier view; active lines only) |
| `GET` | `/companies/{companyId}/requests/{requestId}/billable-lines` | 🏢 | Lines available for invoicing |
| `GET` | `/companies/{companyId}/requests/{requestId}/selection` | 🏢 | Selection for request |
| `GET` | `/companies/{companyId}/requests/{requestId}/quotes/comparison` | 🏢 | Quote comparison matrix |
| `GET` | `/companies/{companyId}/requests/{requestId}/export` | 🏢 | Export request as CSV |

### Create request (`POST /companies/{companyId}/requests`)

Creates a **draft** (`DRAFT`). Quoting starts with `POST .../requests/{requestId}/distribute` from `DRAFT` (see Distribute request below).

**Without `lines`** — empty draft (backward compatible): only header fields (`title`, `reference`, `notes`, `createdAt`).

**With `lines`** — atomic bulk-create of header + all request lines in one transaction.

Request body (relevant fields):

| Field | Type | Description |
|-------|------|-------------|
| `title` | string? | Request title |
| `reference` | string? | External reference |
| `notes` | string? | Notes |
| `createdAt` | ISO datetime? | Override creation timestamp (must be ≤ now; defaults to server time) |
| `lines` | array? | Request lines (min 1 when provided) |

Each line in `lines`:

| Field | Type | Description |
|-------|------|-------------|
| `productId` | uuid? | Explicit catalog product (from autocomplete) |
| `description` | string | Line description (required) |
| `quantity` | string | Positive decimal, up to 4 fractional digits |
| `unit` | string? | Unit of measure |
| `sku` | string? | SKU from file import (stored in `attributes.importSku`) |
| `notes` | string? | Line notes |
| `attributes` | object? | JSON attributes |

**Product resolution on draft create/edit** (when `productId` is not set):

1. Match by `sku` (case-insensitive) in company catalog.
2. Else match by `description` as product `name` (case-insensitive exact).
3. If still unmatched — line is free-form (`productId: null`). New products are **not** created at this stage.

Response `201`: `{ "request": { ... } }`

### List request lines (`GET /companies/{companyId}/request-lines`)

Flat work-queue of request lines across the company. Requires `viewRequests`.

Query params: `limit`, `offset`, `status` (request status), `createdByUserId`, `requestId`, `productId`, `q` (description / product sku|name / request title / `attributes.importSku`), `undistributed=true` (request line has no supplier distributions), `withoutQuotes=true` (line has no quote lines), `sortBy=requestCreatedAt|updatedAt` (default `updatedAt`), `sortOrder=asc|desc` (default `desc`).

Each item includes the line, a short `request` summary, and `links` flags for UI icons: `distributed`, `hasQuote`, `hasSelection`, `hasInvoice`, `hasShipping`, `hasConsolidation`, plus derived `stage` (`quoted`…`consolidated` or `null`). Unlike `GET .../trace/search`, this endpoint paginates in the database and targets buyer operational filters.

### Update request (`PATCH /companies/{companyId}/requests/{requestId}`)

Allowed in any request status. Updates header fields (`title`, `reference`, `notes`, `createdAt` — past or present only) and/or **full-replaces** lines when `lines` is provided:

- line with `id` — update (preserves `lineageId`; cancelled lines cannot be updated — `400 REQUEST_LINE_CANCELLED`)
- line without `id` — create
- existing **active** lines missing from array — hard-delete if unused, otherwise soft-cancel (`cancelledAt`)

Quantity cannot drop below already selected quantity for the line’s `lineageId` (`400 REQUEST_QUANTITY_BELOW_SELECTED`).

Same line fields as create. Product matching rules apply (match only, no auto-create).

### Remove request line (`DELETE /companies/{companyId}/requests/{requestId}/lines/{lineId}`)

Allowed in any request status.

- No quote / distribution references → hard-delete
- Otherwise → soft-cancel (`cancelledAt`); already cancelled → `409 REQUEST_LINE_ALREADY_CANCELLED`
- Response `200`: `{ "success": true }`

Distribute, inbound queues, and selection confirm use **active** lines only (`cancelledAt: null`).

### Distribute request (`POST /companies/{companyId}/requests/{requestId}/distribute`)

Starts quoting by sending selected request lines to one or more suppliers. Allowed when request status is `DRAFT` or `QUOTING`. On first distribute from `DRAFT`, status becomes `QUOTING` and `submittedAt` is set.

Request body:

| Field | Type | Description |
|-------|------|-------------|
| `createProducts` | boolean (default `false`) | Create catalog products for distributed lines still without `productId` |
| `distributions` | array (min 1) | Supplier assignments |

Each item in `distributions`:

| Field | Type | Description |
|-------|------|-------------|
| `supplierCompanyId` | uuid | Active partner supplier company |
| `requestLineIds` | uuid[] (min 1) | Request lines visible and quotable for this supplier |

Example:

```json
{
  "createProducts": false,
  "distributions": [
    { "supplierCompanyId": "uuid-A", "requestLineIds": ["line-1", "line-3"] },
    { "supplierCompanyId": "uuid-B", "requestLineIds": ["line-2"] }
  ]
}
```

Response `200`: `{ "request": { ... }, "productsCreated?": number }`

**Upsert semantics:** for each supplier in `distributions`:

- No existing distribution → create `PENDING` with the given lines
- Existing `PENDING` or `REJECTED` → reset to `PENDING`, replace `requestLineIds`, clear reject metadata, bump `distributedAt`
- Any existing `DRAFT` quote for that supplier on this request is deleted before the replace
- Returns `409 QUOTE_EXISTS_CANNOT_REDISTRIBUTE` if a submitted (or further) quote exists for that supplier on this request

### List request distributions (`GET /companies/{companyId}/requests/{requestId}/distributions`)

Buyer visibility into all supplier assignments for a request. Requires `viewRequests`.

Response `200`:

```json
{
  "distributions": [
    {
      "id": "uuid",
      "requestId": "uuid",
      "status": "PENDING | REJECTED",
      "distributedAt": "2026-07-21T09:00:00.000Z",
      "rejectedAt": null,
      "rejectionReason": null,
      "supplierCompany": { "id": "uuid", "name": "Supplier LLC", "taxId": null },
      "rejectedBy": null,
      "lines": [ /* full request line objects assigned to this supplier */ ]
    }
  ]
}
```

Includes all statuses (`PENDING` and `REJECTED`). Sorted by `distributedAt` descending.

### Delete request distribution (`DELETE /companies/{companyId}/requests/{requestId}/distributions/{distributionId}`)

Buyer removes a supplier assignment. Requires `manageRequests`. Hard-deletes the `RequestDistribution` (lines cascade). Response `204`.

- Existing `DRAFT` quote for that supplier on this request is deleted first
- Returns `409 QUOTE_EXISTS_CANNOT_DELETE_DISTRIBUTION` if a submitted (or further) quote exists
- Returns `403 REQUEST_NOT_DISTRIBUTED` if the distribution id is missing or does not belong to this request
- After delete, the supplier disappears from inbound views; buyer may `POST .../distribute` again to the same supplier

Suppliers see only assigned lines in inbound detail and flat inbound request-lines endpoints. Attempting to quote a non-assigned `requestLineId` returns `403 REQUEST_LINE_NOT_DISTRIBUTED`.

### Inbound requests (supplier view)

Requires `viewQuotes` on the **supplier** company context. Only distributions with status **`PENDING`** appear in inbound list, detail, and flat request-lines.

**List summaries** — `GET /companies/{companyId}/requests/inbound`

Query: `limit`, `offset`, `status?`

Response items: request summary fields + `buyerCompany`, `distributedAt`, `lineCount` (no `lines`).

**Detail** — `GET /companies/{companyId}/requests/inbound/{requestId}`

Response `200`: `{ "request": { ...full request with assigned lines only..., "buyerCompany", "distributedAt" } }`

Returns `403 REQUEST_NOT_DISTRIBUTED` if the request was not distributed to this supplier or the distribution was rejected.

**Reject** — `POST /companies/{companyId}/requests/inbound/{requestId}/reject`

Requires `manageQuotes`. Optional body: `{ "reason": "..." }`.

Response `200`: `{ "distribution": { "status": "REJECTED", "rejectionReason", "lines", ... } }`

After reject, the request disappears from inbound views. A draft quote for this request (if any) is hard-deleted (with comments / document events / notifications). Returns `409 QUOTE_EXISTS_CANNOT_REJECT` if a submitted quote exists. Returns `409 REQUEST_DISTRIBUTION_NOT_REJECTABLE` on repeat reject.

**Flat work-queue** — `GET /companies/{companyId}/request-lines/inbound`

Query: `limit`, `offset`, `status?`, `requestId?`, `productId?`, `q?`, `withoutQuotes=true` (lines this supplier has not quoted yet), `sortBy=requestCreatedAt|updatedAt`, `sortOrder=asc|desc`.

Each item: request line + short `request` summary + `buyerCompany` + `distributedAt` + `links.hasQuote` (supplier-scoped).

**Typical supplier UI flow:**

```text
GET /requests/inbound → open request → GET /requests/inbound/{requestId} → POST /quotes
OR
GET /request-lines/inbound → POST /quotes
Reject: POST /requests/inbound/{requestId}/reject
```

Buyer re-send after reject or to change lines on `PENDING`: same `POST .../distribute` (upsert). Buyer can remove a supplier assignment with `DELETE .../distributions/{distributionId}`.

### Delete request (`DELETE /companies/{companyId}/requests/{requestId}`)

- Allowed only for `DRAFT` (`400 REQUEST_NOT_DELETABLE` otherwise)
- Blocked if quotes, selection, invoices, or shipping documents exist (`409 REQUEST_HAS_DOWNSTREAM_DOCUMENTS`) — cross-document FKs are `Restrict`
- Cascades owned rows only (request lines, distributions); catalog products are kept
- Cleans polymorphic artifacts (comments, document events, notifications) for this request
- Response `204`

**Typical UI flow:** preview file → fill form → `POST /requests` → edit → `PATCH /requests` → `POST .../distribute` with selected `requestLineIds` per supplier and optional `createProducts`

---

## Quotes

Editable in `DRAFT` and `SUBMITTED`. Submit remains from `DRAFT` only.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/quotes` | 🏢 | List supplier quotes |
| `POST` | `/companies/{companyId}/quotes` | 🏢 | Create quote for a request |
| `GET` | `/companies/{companyId}/quotes/{quoteId}` | 🏢 | Get quote with lines |
| `PATCH` | `/companies/{companyId}/quotes/{quoteId}` | 🏢 | Update quote header |
| `DELETE` | `/companies/{companyId}/quotes/{quoteId}` | 🏢 | Delete draft quote (`204`) |
| `POST` | `/companies/{companyId}/quotes/{quoteId}/lines` | 🏢 | Add quote line |
| `PATCH` | `/companies/{companyId}/quotes/{quoteId}/lines/{lineId}` | 🏢 | Update quote line |
| `DELETE` | `/companies/{companyId}/quotes/{quoteId}/lines/{lineId}` | 🏢 | Remove quote line |
| `POST` | `/companies/{companyId}/quotes/{quoteId}/submit` | 🏢 | Submit quote to buyer |

### Delete quote (`DELETE /companies/{companyId}/quotes/{quoteId}`)

- `DRAFT` only (`400 QUOTE_NOT_DELETABLE`)
- Blocked if any selection line references the quote (`409 QUOTE_HAS_SELECTIONS`)
- Cleans comments / events / notifications for the quote
- Response `204`

Removing a quote line is blocked if a selection references it (`409 QUOTE_LINE_HAS_SELECTIONS`). Cancelled request lines cannot be quoted (`400 REQUEST_LINE_CANCELLED`).

---

## Selections

Editable in `DRAFT` and `CONFIRMED` (not `CANCELLED`). Confirm / cancel remain draft-only transitions.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/selections` | 🏢 | List purchase selections |
| `POST` | `/companies/{companyId}/selections` | 🏢 | Create selection for request |
| `GET` | `/companies/{companyId}/selections/{selectionId}` | 🏢 | Get selection with lines |
| `PATCH` | `/companies/{companyId}/selections/{selectionId}` | 🏢 | Update selection notes |
| `DELETE` | `/companies/{companyId}/selections/{selectionId}` | 🏢 | Delete draft selection (`204`) |
| `POST` | `/companies/{companyId}/selections/{selectionId}/lines` | 🏢 | Add selection line |
| `PATCH` | `/companies/{companyId}/selections/{selectionId}/lines/{lineId}` | 🏢 | Update selection line |
| `DELETE` | `/companies/{companyId}/selections/{selectionId}/lines/{lineId}` | 🏢 | Remove selection line |
| `POST` | `/companies/{companyId}/selections/{selectionId}/confirm` | 🏢 | Confirm selection |
| `POST` | `/companies/{companyId}/selections/{selectionId}/cancel` | 🏢 | Cancel selection |

### Delete selection (`DELETE /companies/{companyId}/selections/{selectionId}`)

- `DRAFT` only (`400 SELECTION_NOT_DELETABLE`)
- Blocked if invoices reference selection lines (`409 SELECTION_HAS_INVOICES`)
- Cleans comments / events / notifications
- Response `204`

Removing a selection line is blocked if invoiced (`409 SELECTION_LINE_HAS_INVOICES`).

---

## Invoices

Editable in `DRAFT` and `ISSUED` (not paid / confirmed).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/invoices` | 🏢 | List invoices (`direction`, `status`) |
| `POST` | `/companies/{companyId}/invoices` | 🏢 | Create draft invoice |
| `GET` | `/companies/{companyId}/invoices/{invoiceId}` | 🏢 | Get invoice with lines |
| `PATCH` | `/companies/{companyId}/invoices/{invoiceId}` | 🏢 | Update invoice header |
| `DELETE` | `/companies/{companyId}/invoices/{invoiceId}` | 🏢 | Delete draft invoice (`204`) |
| `POST` | `/companies/{companyId}/invoices/{invoiceId}/lines` | 🏢 | Add invoice line |
| `PATCH` | `/companies/{companyId}/invoices/{invoiceId}/lines/{lineId}` | 🏢 | Update invoice line |
| `DELETE` | `/companies/{companyId}/invoices/{invoiceId}/lines/{lineId}` | 🏢 | Remove invoice line |
| `POST` | `/companies/{companyId}/invoices/{invoiceId}/issue` | 🏢 | Issue invoice |
| `POST` | `/companies/{companyId}/invoices/{invoiceId}/confirm` | 🏢 | Confirm invoice fully paid |

### Delete invoice (`DELETE /companies/{companyId}/invoices/{invoiceId}`)

- `DRAFT` only (`400 INVOICE_NOT_DELETABLE`)
- Blocked if shipping invoices exist (`409 INVOICE_HAS_SHIPPING`)
- Cascades owned payments; cleans artifacts for the invoice **and** its payments
- Response `204`

Removing an invoice line is blocked if shipped (`409 INVOICE_LINE_HAS_SHIPPING`).

---

## Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/payments` | 🏢 | List payments |
| `POST` | `/companies/{companyId}/payments` | 🏢 | Register payment |
| `GET` | `/companies/{companyId}/payments/{paymentId}` | 🏢 | Get payment |
| `POST` | `/companies/{companyId}/payments/{paymentId}/upload` | 🏢 | Upload payment proof (multipart) |
| `POST` | `/companies/{companyId}/payments/{paymentId}/confirm` | 🏢 | Confirm payment (accountant) |
| `POST` | `/companies/{companyId}/payments/{paymentId}/reject` | 🏢 | Reject payment (accountant) |

---

## Shipping invoices

Editable in `DRAFT` and `ISSUED` (not `IN_TRANSIT` / `DELIVERED`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/shipping-invoices` | 🏢 | List shipping invoices |
| `POST` | `/companies/{companyId}/shipping-invoices` | 🏢 | Create shipping invoice |
| `GET` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}` | 🏢 | Get shipping invoice |
| `PATCH` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}` | 🏢 | Update shipping invoice |
| `DELETE` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}` | 🏢 | Delete draft shipping invoice (`204`) |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/lines` | 🏢 | Add shipping line |
| `PATCH` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/lines/{lineId}` | 🏢 | Update shipping line |
| `DELETE` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/lines/{lineId}` | 🏢 | Remove shipping line |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/issue` | 🏢 | Issue shipping invoice |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/mark-in-transit` | 🏢 | Mark in transit |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/mark-delivered` | 🏢 | Mark delivered |
| `GET` | `/companies/{companyId}/invoices/{invoiceId}/shippable-lines` | 🏢 | Lines ready to ship |

### Delete shipping invoice (`DELETE /companies/{companyId}/shipping-invoices/{shippingInvoiceId}`)

- `DRAFT` only (`400 SHIPPING_INVOICE_NOT_DELETABLE`)
- Blocked if part of a consolidation (`409 SHIPPING_INVOICE_HAS_CONSOLIDATION`)
- Cleans comments / events / notifications
- Response `204`

---

## Consolidations

Editable in `DRAFT` and `PLANNED` (not later logistics statuses). Plan remains from `DRAFT` only.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/consolidations` | 🏢 | List consolidations |
| `POST` | `/companies/{companyId}/consolidations` | 🏢 | Create consolidation |
| `GET` | `/companies/{companyId}/consolidations/{consolidationId}` | 🏢 | Get consolidation |
| `PATCH` | `/companies/{companyId}/consolidations/{consolidationId}` | 🏢 | Update consolidation |
| `DELETE` | `/companies/{companyId}/consolidations/{consolidationId}` | 🏢 | Delete draft consolidation (`204`) |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/shipping-invoices` | 🏢 | Add shipping invoice |
| `DELETE` | `/companies/{companyId}/consolidations/{consolidationId}/shipping-invoices/{shippingInvoiceId}` | 🏢 | Remove shipping invoice |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/plan` | 🏢 | Plan consolidation |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/mark-in-transit` | 🏢 | Mark in transit |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/mark-customs` | 🏢 | Mark at customs |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/mark-delivered` | 🏢 | Mark delivered |
| `GET` | `/companies/{companyId}/consolidatable-shipping-invoices` | 🏢 | Shipping invoices eligible for consolidation |

### Delete consolidation (`DELETE /companies/{companyId}/consolidations/{consolidationId}`)

- `DRAFT` only (`400 CONSOLIDATION_NOT_DELETABLE`)
- Cascades link rows to shipping invoices (shipping invoices themselves are kept)
- Cleans comments / events / notifications
- Response `204`

---

## Communication

`documentType`: `MATERIAL_REQUEST` | `SUPPLIER_QUOTE` | `PURCHASE_SELECTION` | `INVOICE` | `PAYMENT` | `SHIPPING_INVOICE` | `CONSOLIDATION`

Comments, document events, and related notifications are **not** FK-linked to document tables. Hard-delete of a document cleans them via `deleteDocumentArtifacts` (for invoice delete, payment artifacts are cleaned too).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/documents/{documentType}/{documentId}/comments` | 🏢 | List comments (cursor) |
| `POST` | `/companies/{companyId}/documents/{documentType}/{documentId}/comments` | 🏢 | Create comment |
| `GET` | `/companies/{companyId}/documents/{documentType}/{documentId}/activity` | 🏢 | Activity feed (cursor) |
| `GET` | `/companies/{companyId}/notifications` | 🏢 | List notifications (cursor) |
| `GET` | `/companies/{companyId}/notifications/unread-count` | 🏢 | Unread notification count |
| `POST` | `/companies/{companyId}/notifications/{notificationId}/read` | 🏢 | Mark notification read |
| `POST` | `/companies/{companyId}/notifications/read-all` | 🏢 | Mark all notifications read |

---

## Trace

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/trace/search` | 🏢 | Search traceable lines |
| `GET` | `/companies/{companyId}/trace/{lineageId}` | 🏢 | Full lineage chain |
| `GET` | `/companies/{companyId}/trace/{lineageId}/events` | 🏢 | Audit events for lineage |
| `GET` | `/companies/{companyId}/documents/{documentType}/{documentId}/relationships` | 🏢 | Related documents graph |

---

## Integration — Import

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/companies/{companyId}/imports/request-lines` | 🏢 | Upload CSV; returns import job (`202`) |
| `POST` | `/companies/{companyId}/imports/request-lines/csv/preview` | 🏢 | Parse CSV in memory; returns import preview (`200`) |
| `POST` | `/companies/{companyId}/imports/request-lines/htm/preview` | 🏢 | Parse 1C HTM in memory; returns import preview (`200`) |
| `GET` | `/companies/{companyId}/imports/{jobId}` | 🏢 | Get import job status and preview |
| `POST` | `/companies/{companyId}/imports/{jobId}/confirm` | 🏢 | Create request from valid rows |

### Import preview (`.../csv/preview`, `.../htm/preview`)

`multipart/form-data`:

| Field | Required | Description |
|-------|----------|-------------|
| `file` | yes | CSV or HTM file |
| `fieldDelimiter` | no | CSV only: `,`, `;`, `\t`, `tab` |
| `decimalSeparator` | no | `.` or `,` |

Response `200`:

```json
{
  "preview": {
    "rows": [
      {
        "rowNumber": 1,
        "data": { "description": "...", "quantity": "...", "sku": "..." },
        "errors": [],
        "parsed": {
          "description": "...",
          "quantity": "100",
          "unit": "pcs",
          "sku": "00000001134",
          "productId": "uuid-or-null",
          "notes": null
        }
      }
    ],
    "validRowCount": 1,
    "invalidRowCount": 0
  },
  "columnMapping": { "sku": "Код", "description": "Номенклатура" }
}
```

**Product matching in preview:** for each valid row, `parsed.productId` is resolved by **SKU first**, then by **description** (product name). Only active catalog products are matched. Missing product is not an error — `productId` is `null`; the UI can offer `createProducts` on final submit.

Preview does **not** persist data. For the create-request form flow, map `parsed` rows into `POST /companies/{companyId}/requests` body `lines`.

**Async import job** (`POST .../imports/request-lines` → confirm) is a separate path; it does not support `createProducts` or mixing with manually entered lines.

---

## Integration — Export

Export endpoints accept JWT + company header **or** API key.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/integration/invoices/{invoiceId}/export` | 🔐 | Export invoice as JSON |
| `GET` | `/companies/{companyId}/integration/shipping-invoices/{shippingInvoiceId}/export` | 🔐 | Export shipping invoice as JSON |
| `GET` | `/companies/{companyId}/integration/consolidations/{consolidationId}/export` | 🔐 | Export consolidation as JSON |
| `GET` | `/companies/{companyId}/integration/trace/{lineageId}/export` | 🔐 | Export lineage as JSON |
| `GET` | `/companies/{companyId}/integration/requests/{requestId}/export` | 🔐 | Export request as JSON |
| `POST` | `/companies/{companyId}/integration/exports` | 🏢 | Create async export job |
| `GET` | `/companies/{companyId}/integration/exports/{jobId}` | 🏢 | Get export job status |
| `GET` | `/companies/{companyId}/integration/exports/{jobId}/download` | 🏢 | Download export file |

---

## Integration — External sync

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `PUT` | `/companies/{companyId}/integration/requests/{externalId}` | 🔐 | Upsert request from external system (e.g. 1C) |

---

## Integration — Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/integration/api-keys` | 🏢 | List API keys |
| `POST` | `/companies/{companyId}/integration/api-keys` | 🏢 | Create API key |
| `DELETE` | `/companies/{companyId}/integration/api-keys/{keyId}` | 🏢 | Revoke API key |
| `GET` | `/companies/{companyId}/integration/mappings` | 🏢 | List partner/product mappings |
| `POST` | `/companies/{companyId}/integration/mappings` | 🏢 | Create mapping |
| `PATCH` | `/companies/{companyId}/integration/mappings/{mappingId}` | 🏢 | Update mapping |
| `DELETE` | `/companies/{companyId}/integration/mappings/{mappingId}` | 🏢 | Delete mapping |
| `GET` | `/companies/{companyId}/integration/webhooks` | 🏢 | List webhooks |
| `POST` | `/companies/{companyId}/integration/webhooks` | 🏢 | Create webhook |
| `PATCH` | `/companies/{companyId}/integration/webhooks/{webhookId}` | 🏢 | Update webhook |
| `DELETE` | `/companies/{companyId}/integration/webhooks/{webhookId}` | 🏢 | Delete webhook (`204`) |

---

## Common query parameters

| Parameter | Used on | Description |
|-----------|---------|-------------|
| `limit` | List endpoints | Page size (1–100, default 20) |
| `offset` | List endpoints | Offset pagination |
| `cursor` | Comments, notifications | Cursor pagination |
| `status` | Document lists, requests | Filter by document status enum |
| `productId` | Requests, request-lines | Filter by catalog product |
| `direction` | Invoices, shipping | `inbound` or `outbound` |
| `requestId` | Quotes, selections, invoices, request-lines | Filter by material request |
| `q` | Products, trace search, partners, request-lines | Text search |
| `createdByUserId` | Request-lines | Filter by request author |
| `undistributed` | Request-lines | `true` — request lines with no supplier distributions |
| `withoutQuotes` | Request-lines, inbound request-lines | `true` — lines with no quote lines (inbound: no quote from this supplier) |
| `sortBy` | Request-lines | `requestCreatedAt` or `updatedAt` (default `updatedAt`) |
| `sortOrder` | Request-lines | `asc` or `desc` (default `desc`) |
| `unreadOnly` | Notifications | `true` / `false` |

---

## HTTP status codes

| Code | Usage |
|------|-------|
| `200` | Success with body |
| `201` | Resource created |
| `202` | Accepted (async import job) |
| `204` | Success, no body (logout, delete) |
| `400` | Validation or business rule error |
| `401` | Missing or invalid token |
| `403` | Not a member or insufficient permission |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, partner link, etc.) |
| `413` | Upload too large |
| `429` | Rate limit (e.g. verification resend too soon) |
| `503` | Service not ready |

---

## Related documents

- [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) — backend architecture and conventions
- [`PRODUCT_OVERVIEW.md`](./PRODUCT_OVERVIEW.md) — product overview
- Interactive docs — run server and open `/docs` (OpenAPI / Swagger UI)

*Generated from implemented routes. For request/response schemas, use OpenAPI at `/docs`.*
