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
| `POST` | `/companies` | 🔑 | Create a company |
| `GET` | `/companies` | 🔑 | List companies for current user (paginated: `limit`, `offset`) |
| `GET` | `/companies/{companyId}` | 🏢 | Get company details |
| `GET` | `/companies/{companyId}/members` | 🏢 | List company members (paginated) |
| `GET` | `/companies/{companyId}/members/invitations` | 🏢 | List pending invitations (`MemberInvitation`, including expired; paginated) |
| `POST` | `/companies/{companyId}/members/invite` | 🏢 | Invite member by email (`locale?`; always creates `MemberInvitation`) |
| `DELETE` | `/companies/{companyId}/members/invitations/{invitationId}` | 🏢 | Revoke pending invitation |
| `POST` | `/companies/{companyId}/members/accept` | 🔑 | Accept pending invitation |
| `DELETE` | `/companies/{companyId}/members/{memberId}` | 🏢 | Remove active member (hard delete; not OWNER) |
| `PATCH` | `/companies/{companyId}/members/{memberId}/role` | 🏢 | Change member role |
| `PATCH` | `/companies/{companyId}/members/{memberId}/permissions` | 🏢 | Set permission grants/denies |

---

## Partners

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/partners` | 🏢 | List all partner links |
| `GET` | `/companies/{companyId}/partners/inbound` | 🏢 | Inbound partner invitations |
| `GET` | `/companies/{companyId}/partners/outbound` | 🏢 | Outbound partner invitations |
| `GET` | `/companies/{companyId}/partners/directory` | 🏢 | Search companies (`q` or `taxId`) |
| `POST` | `/companies/{companyId}/partners/invite` | 🏢 | Invite partner company |
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

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/requests` | 🏢 | List material requests (`status?`, `productId?`) |
| `GET` | `/companies/{companyId}/request-lines` | 🏢 | List request lines across company (work-queue filters + pipeline links) |
| `POST` | `/companies/{companyId}/requests` | 🏢 | Create draft request (optionally with lines in one request) |
| `GET` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Get request with lines |
| `PATCH` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Update draft request (optionally full-replace `lines`) |
| `DELETE` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Delete draft request (`204`, DRAFT only) |
| `POST` | `/companies/{companyId}/requests/{requestId}/lines` | 🏢 | Add request line |
| `PATCH` | `/companies/{companyId}/requests/{requestId}/lines/{lineId}` | 🏢 | Update request line |
| `DELETE` | `/companies/{companyId}/requests/{requestId}/lines/{lineId}` | 🏢 | Remove request line |
| `POST` | `/companies/{companyId}/requests/{requestId}/submit` | 🏢 | Submit request (`createProducts?`) |
| `POST` | `/companies/{companyId}/requests/{requestId}/distribute` | 🏢 | Send request to suppliers |
| `GET` | `/companies/{companyId}/requests/inbound` | 🏢 | Inbound requests (supplier view) |
| `GET` | `/companies/{companyId}/requests/{requestId}/billable-lines` | 🏢 | Lines available for invoicing |
| `GET` | `/companies/{companyId}/requests/{requestId}/selection` | 🏢 | Selection for request |
| `GET` | `/companies/{companyId}/requests/{requestId}/quotes/comparison` | 🏢 | Quote comparison matrix |
| `GET` | `/companies/{companyId}/requests/{requestId}/export` | 🏢 | Export request as CSV |

### Create request (`POST /companies/{companyId}/requests`)

Creates a **draft** (`DRAFT`). Submit is a separate call: `POST .../requests/{requestId}/submit`.

**Without `lines`** — empty draft (backward compatible): only header fields (`title`, `reference`, `notes`).

**With `lines`** — atomic bulk-create of header + all request lines in one transaction.

Request body (relevant fields):

| Field | Type | Description |
|-------|------|-------------|
| `title` | string? | Request title |
| `reference` | string? | External reference |
| `notes` | string? | Notes |
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

Query params: `limit`, `offset`, `status` (request status), `createdByUserId`, `requestId`, `productId`, `q` (description / product sku|name / request title / `attributes.importSku`), `undistributed=true` (request has no distributions), `withoutQuotes=true` (line has no quote lines), `sortBy=requestCreatedAt|updatedAt` (default `updatedAt`), `sortOrder=asc|desc` (default `desc`).

Each item includes the line, a short `request` summary, and `links` flags for UI icons: `distributed`, `hasQuote`, `hasSelection`, `hasInvoice`, `hasShipping`, `hasConsolidation`, plus derived `stage` (`quoted`…`consolidated` or `null`). Unlike `GET .../trace/search`, this endpoint paginates in the database and targets buyer operational filters.

### Update request (`PATCH /companies/{companyId}/requests/{requestId}`)

Draft only. Updates header fields and/or **full-replaces** lines when `lines` is provided:

- line with `id` — update (preserves `lineageId`)
- line without `id` — create
- existing lines missing from array — delete

Same line fields as create. Product matching rules apply (match only, no auto-create).

### Submit request (`POST /companies/{companyId}/requests/{requestId}/submit`)

Body (optional, defaults apply):

| Field | Type | Description |
|-------|------|-------------|
| `createProducts` | boolean (default `false`) | Create catalog products for lines still without `productId` |

When `createProducts: true`:

- Uses `description` as product name; SKU from `attributes.importSku` if present
- Requires `manageRequests` (not `manageProducts`)
- Response may include `productsCreated`

Response `200`:

```json
{
  "request": { "...": "MaterialRequest SUBMITTED with lines" },
  "productsCreated": 2
}
```

### Delete request (`DELETE /companies/{companyId}/requests/{requestId}`)

- Allowed only for `DRAFT` requests (`400 REQUEST_NOT_DELETABLE` otherwise)
- Cascades delete of request lines; catalog products are kept
- Response `204`

**Typical UI flow:** preview file → fill form → `POST /requests` → edit → `PATCH /requests` → `POST .../submit` with `createProducts?`

---

## Quotes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/quotes` | 🏢 | List supplier quotes |
| `POST` | `/companies/{companyId}/quotes` | 🏢 | Create quote for a request |
| `GET` | `/companies/{companyId}/quotes/{quoteId}` | 🏢 | Get quote with lines |
| `PATCH` | `/companies/{companyId}/quotes/{quoteId}` | 🏢 | Update draft quote |
| `POST` | `/companies/{companyId}/quotes/{quoteId}/lines` | 🏢 | Add quote line |
| `PATCH` | `/companies/{companyId}/quotes/{quoteId}/lines/{lineId}` | 🏢 | Update quote line |
| `DELETE` | `/companies/{companyId}/quotes/{quoteId}/lines/{lineId}` | 🏢 | Remove quote line |
| `POST` | `/companies/{companyId}/quotes/{quoteId}/submit` | 🏢 | Submit quote to buyer |

---

## Selections

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/selections` | 🏢 | List purchase selections |
| `POST` | `/companies/{companyId}/selections` | 🏢 | Create selection for request |
| `GET` | `/companies/{companyId}/selections/{selectionId}` | 🏢 | Get selection with lines |
| `PATCH` | `/companies/{companyId}/selections/{selectionId}` | 🏢 | Update selection notes |
| `POST` | `/companies/{companyId}/selections/{selectionId}/lines` | 🏢 | Add selection line |
| `PATCH` | `/companies/{companyId}/selections/{selectionId}/lines/{lineId}` | 🏢 | Update selection line |
| `DELETE` | `/companies/{companyId}/selections/{selectionId}/lines/{lineId}` | 🏢 | Remove selection line |
| `POST` | `/companies/{companyId}/selections/{selectionId}/confirm` | 🏢 | Confirm selection |
| `POST` | `/companies/{companyId}/selections/{selectionId}/cancel` | 🏢 | Cancel selection |

---

## Invoices

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/invoices` | 🏢 | List invoices (`direction`, `status`) |
| `POST` | `/companies/{companyId}/invoices` | 🏢 | Create draft invoice |
| `GET` | `/companies/{companyId}/invoices/{invoiceId}` | 🏢 | Get invoice with lines |
| `PATCH` | `/companies/{companyId}/invoices/{invoiceId}` | 🏢 | Update draft invoice |
| `POST` | `/companies/{companyId}/invoices/{invoiceId}/lines` | 🏢 | Add invoice line |
| `PATCH` | `/companies/{companyId}/invoices/{invoiceId}/lines/{lineId}` | 🏢 | Update invoice line |
| `DELETE` | `/companies/{companyId}/invoices/{invoiceId}/lines/{lineId}` | 🏢 | Remove invoice line |
| `POST` | `/companies/{companyId}/invoices/{invoiceId}/issue` | 🏢 | Issue invoice |
| `POST` | `/companies/{companyId}/invoices/{invoiceId}/confirm` | 🏢 | Confirm invoice fully paid |

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

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/shipping-invoices` | 🏢 | List shipping invoices |
| `POST` | `/companies/{companyId}/shipping-invoices` | 🏢 | Create shipping invoice |
| `GET` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}` | 🏢 | Get shipping invoice |
| `PATCH` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}` | 🏢 | Update draft shipping invoice |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/lines` | 🏢 | Add shipping line |
| `PATCH` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/lines/{lineId}` | 🏢 | Update shipping line |
| `DELETE` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/lines/{lineId}` | 🏢 | Remove shipping line |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/issue` | 🏢 | Issue shipping invoice |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/mark-in-transit` | 🏢 | Mark in transit |
| `POST` | `/companies/{companyId}/shipping-invoices/{shippingInvoiceId}/mark-delivered` | 🏢 | Mark delivered |
| `GET` | `/companies/{companyId}/invoices/{invoiceId}/shippable-lines` | 🏢 | Lines ready to ship |

---

## Consolidations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/consolidations` | 🏢 | List consolidations |
| `POST` | `/companies/{companyId}/consolidations` | 🏢 | Create consolidation |
| `GET` | `/companies/{companyId}/consolidations/{consolidationId}` | 🏢 | Get consolidation |
| `PATCH` | `/companies/{companyId}/consolidations/{consolidationId}` | 🏢 | Update consolidation |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/shipping-invoices` | 🏢 | Add shipping invoice |
| `DELETE` | `/companies/{companyId}/consolidations/{consolidationId}/shipping-invoices/{shippingInvoiceId}` | 🏢 | Remove shipping invoice |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/plan` | 🏢 | Plan consolidation |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/mark-in-transit` | 🏢 | Mark in transit |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/mark-customs` | 🏢 | Mark at customs |
| `POST` | `/companies/{companyId}/consolidations/{consolidationId}/mark-delivered` | 🏢 | Mark delivered |
| `GET` | `/companies/{companyId}/consolidatable-shipping-invoices` | 🏢 | Shipping invoices eligible for consolidation |

---

## Communication

`documentType`: `MATERIAL_REQUEST` | `SUPPLIER_QUOTE` | `PURCHASE_SELECTION` | `INVOICE` | `PAYMENT` | `SHIPPING_INVOICE` | `CONSOLIDATION`

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
          "quantity": "100.000",
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
| `undistributed` | Request-lines | `true` — requests with no supplier distributions |
| `withoutQuotes` | Request-lines | `true` — lines with no quote lines |
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
