# CHN API Reference

Concise REST API catalog for **CHN Procurement & Logistics** backend.

| Item | Value |
|------|-------|
| OpenAPI | 3.1 (live spec: `/docs`, JSON: `/docs/json`) |
| Base URL | `/api/v1` |
| Format | JSON (`application/json`) |
| Auth | Bearer JWT and/or `X-Company-Id` header |
| Errors | `{ "error": { "code", "message", "details?" } }` |

**Legend — Auth**

| Symbol | Meaning |
|--------|---------|
| — | Public |
| 🔑 | `Authorization: Bearer <token>` |
| 🏢 | JWT + `X-Company-Id: <uuid>` |
| 🔐 | JWT or API key (`Authorization: Bearer chn_live_…` or `X-Api-Key`) + company context |

Paths below omit the `/api/v1` prefix unless noted.

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
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login; returns access & refresh tokens |
| `POST` | `/auth/refresh` | — | Refresh token pair |
| `POST` | `/auth/logout` | 🔑 | Revoke refresh token |
| `GET` | `/auth/me` | 🔑 | Current user and company memberships |

---

## Companies

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/companies` | 🔑 | Create a company |
| `GET` | `/companies` | 🔑 | List companies for current user |
| `GET` | `/companies/{companyId}` | 🏢 | Get company details |
| `GET` | `/companies/{companyId}/members` | 🏢 | List company members |
| `POST` | `/companies/{companyId}/members/invite` | 🏢 | Invite member by email |
| `POST` | `/companies/{companyId}/members/accept` | 🔑 | Accept pending invitation |
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

---

## Material requests

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/companies/{companyId}/requests` | 🏢 | List material requests |
| `POST` | `/companies/{companyId}/requests` | 🏢 | Create draft request |
| `GET` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Get request with lines |
| `PATCH` | `/companies/{companyId}/requests/{requestId}` | 🏢 | Update draft request |
| `POST` | `/companies/{companyId}/requests/{requestId}/lines` | 🏢 | Add request line |
| `PATCH` | `/companies/{companyId}/requests/{requestId}/lines/{lineId}` | 🏢 | Update request line |
| `DELETE` | `/companies/{companyId}/requests/{requestId}/lines/{lineId}` | 🏢 | Remove request line |
| `POST` | `/companies/{companyId}/requests/{requestId}/submit` | 🏢 | Submit request |
| `POST` | `/companies/{companyId}/requests/{requestId}/distribute` | 🏢 | Send request to suppliers |
| `GET` | `/companies/{companyId}/requests/inbound` | 🏢 | Inbound requests (supplier view) |
| `GET` | `/companies/{companyId}/requests/{requestId}/billable-lines` | 🏢 | Lines available for invoicing |
| `GET` | `/companies/{companyId}/requests/{requestId}/selection` | 🏢 | Selection for request |
| `GET` | `/companies/{companyId}/requests/{requestId}/quotes/comparison` | 🏢 | Quote comparison matrix |
| `GET` | `/companies/{companyId}/requests/{requestId}/export` | 🏢 | Export request as CSV |

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
| `GET` | `/companies/{companyId}/imports/{jobId}` | 🏢 | Get import job status and preview |
| `POST` | `/companies/{companyId}/imports/{jobId}/confirm` | 🏢 | Create request from valid rows |

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
| `status` | Document lists | Filter by document status enum |
| `direction` | Invoices, shipping | `inbound` or `outbound` |
| `requestId` | Quotes, selections, invoices | Filter by material request |
| `q` | Products, trace search, partners | Text search |
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
| `422` | Unprocessable (e.g. invite unregistered user) |
| `503` | Service not ready |

---

## Related documents

- [Frontend specification](./frontend-spec.md) — detailed client integration guide
- [API integration](./api-integration.md) — auth, headers, pagination
- [Developer guide](./developer-guide.md) — frontend architecture
- Interactive docs — run backend and open `/docs`

*For request/response schemas, use OpenAPI at `/docs` or `openapi/api-docs.json`.*
