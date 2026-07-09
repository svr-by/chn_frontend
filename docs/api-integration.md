# API Integration

How the CHN frontend connects to the backend REST API.

For the full endpoint list see [API reference](./api-reference.md).  
For architecture and codegen see [developer guide](./developer-guide.md).

---

## Connection overview

| Item | Value |
|------|-------|
| API prefix | `/api/v1` |
| Dev base URL | `/api/v1` (Vite proxy → `http://127.0.0.1:3000`) |
| Production | Set `VITE_API_BASE_URL` to your API origin + `/api/v1` |
| Health | `GET /health` (no prefix) |
| Readiness | `GET /ready` (no prefix) |
| OpenAPI UI | `GET /docs` (backend, when Swagger enabled) |
| OpenAPI JSON | `GET /docs/json` or `openapi/api-docs.json` |

---

## Required headers

### Protected routes

```http
Authorization: Bearer <accessToken>
```

### Company-scoped routes (most business endpoints)

```http
Authorization: Bearer <accessToken>
X-Company-Id: <activeCompanyUuid>
Content-Type: application/json
```

The frontend sets these in `src/api/baseApi.ts` via `prepareHeaders`, reading the token from `authStorage` and `activeCompanyId` from Redux.

### File uploads

```http
Content-Type: multipart/form-data
```

Used for CSV import and payment proof uploads. Do not set `Content-Type` manually when using `FormData` — the browser adds the boundary.

---

## Authentication flow

```text
Register  → POST /auth/register        (no tokens; optional inviteToken, locale)
            → verify email via link    → POST /auth/verify-email { token }
Login     → POST /auth/login           → accessToken + refreshToken + user.emailVerified
Boot      → GET  /auth/me              → user.emailVerified + memberships + effectivePermissions
Refresh   → POST /auth/refresh         on 401 (token rotation)
Logout    → POST /auth/logout          + body { refreshToken } → 204
Forgot    → POST /auth/forgot-password { email, locale? }
Reset     → POST /auth/reset-password  { token, password }
Resend    → POST /auth/resend-verification { locale? }  (JWT required)
```

Registration does **not** return tokens. After register, prompt the user to verify email before login (or show a “check your inbox” screen). `user.emailVerified` is returned on login and `/auth/me`.

Optional `locale` on auth and invite endpoints: `"en"` | `"ru"` — used for transactional emails.

### Token storage

- `accessToken` and `refreshToken` — `localStorage` via `authStorage`
- `activeCompanyId` — Redux + persisted storage
- Access TTL default: **15 minutes**
- Refresh TTL default: **7 days**

### Refresh behavior

On `401` (except auth endpoints), `baseQueryWithReauth`:

1. Calls `/auth/refresh` with the stored refresh token (deduplicated if multiple requests fail at once)
2. Updates tokens in Redux and storage
3. Retries the original request
4. On failure → `clearSession()` and redirect to login

### Company member invitations

Pending invites are **not** memberships. `CompanyMember.status` is only `ACTIVE` | `SUSPENDED`. Invitations are a separate resource.

**Invite (admin/owner):**

```http
POST /api/v1/companies/{companyId}/members/invite
Authorization: Bearer <accessToken>
X-Company-Id: <companyId>
Content-Type: application/json

{ "email": "...", "role": "PROCUREMENT", "locale": "en" }
```

Response `201`: `{ "invitation": { id, email, role, invitedAt, expiresAt, expired, invitedBy } }`

**List / revoke pending invitations:**

```http
GET    /api/v1/companies/{companyId}/members/invitations?limit=20&offset=0
DELETE /api/v1/companies/{companyId}/members/invitations/{invitationId}   → 204
```

**Accept invitation — two flows:**

1. **New user** — email link opens `/register?inviteToken=…`; pass `inviteToken` in register body. Response may include `acceptedMembership` (company joined on register).
2. **Existing user** — after login, call accept (no body):

```http
POST /api/v1/companies/{companyId}/members/accept
Authorization: Bearer <accessToken>
```

Response `200`: `{ "member": { … } }`. No `X-Company-Id` required.

**Remove member:**

```http
DELETE /api/v1/companies/{companyId}/members/{memberId}   → 204
```

---

## Response format

### Success

Entities are wrapped in named keys:

```json
{ "request": { } }
{ "requests": [ ], "pagination": { "total": 42, "limit": 20, "offset": 0 } }
{ "user": { } }
```

### Errors

Always:

```json
{
  "error": {
    "code": "REQUEST_NOT_EDITABLE",
    "message": "Request cannot be edited in its current status",
    "details": { }
  }
}
```

| Field | Use in UI |
|-------|-----------|
| `code` | i18n key, conditional handling |
| `message` | English fallback from server |
| `details` | Field-level validation info |

Common HTTP statuses: `400` validation/business, `401` auth, `403` permission, `404` not found, `409` conflict, `413` file too large, `422` unprocessable.

The `isApiError()` helper in `baseApi.ts` narrows unknown error payloads.

---

## Data conventions

| Type | Format | Frontend rule |
|------|--------|---------------|
| IDs | UUID strings | Use as-is |
| Dates | ISO 8601 | Parse with `dayjs` for display |
| Quantities, amounts, prices | **Decimal strings** | `"10"`, `"10.5"` — max 4 decimal places; use `decimal.js`, never `number` in payloads |
| Currency | 3-letter code | `"USD"`, `"EUR"` |
| Enums | `SCREAMING_SNAKE_CASE` | Match backend exactly |

---

## Pagination

### Offset (most list endpoints)

```http
GET /api/v1/companies/:companyId/requests?limit=20&offset=0
```

```json
{
  "requests": [ ],
  "pagination": { "total": 100, "limit": 20, "offset": 0 }
}
```

- `limit`: 1–100, default 20
- `offset`: default 0

Wire to material-react-table pagination in list pages.

### Cursor (notifications, comments, activity)

```http
GET /api/v1/companies/:companyId/notifications?limit=20&cursor=<optional>
```

Response includes `nextCursor: string | null`. Pass `cursor` for the next page.

---

## Bilateral documents

Many documents have both `buyerCompanyId` and `supplierCompanyId`. List endpoints support:

- `direction=inbound` — counterparty view (documents received)
- `direction=outbound` — documents sent by active company

Use separate tabs or filters in invoice and shipping list UIs.

---

## OpenAPI codegen workflow

1. **Sync spec** — copy `chn_backend/.cursor/api-docs.json` to `openapi/api-docs.json`
2. **Generate** — `npm run codegen`
3. **Add endpoints** — create `src/api/endpoints/<domain>Api.ts`:

```typescript
import { baseApi } from '@/api/baseApi';

export const requestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listRequests: build.query({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/requests`,
        params,
      }),
      providesTags: ['Requests'],
    }),
  }),
});
```

4. **Export hooks** — `useListRequestsQuery`, etc.
5. **Invalidate** — use `invalidatesTags` on mutations

Generated models live in `src/api/generated/models/`. Hand-written baseline types in `src/types/api.ts` supplement enums and shared shapes.

---

## Async jobs

### CSV import

```http
POST /companies/:companyId/imports/request-lines   → 202 { job }
GET  /companies/:companyId/imports/:jobId
POST /companies/:companyId/imports/:jobId/confirm
```

Poll job status every 1–2 s. Backend **worker** process required.

### Export jobs

```http
POST /companies/:companyId/integration/exports     → 202
GET  /companies/:companyId/integration/exports/:jobId
GET  /companies/:companyId/integration/exports/:jobId/download
```

---

## Traceability API

Every document line carries `lineageId`. Key endpoints:

```http
GET /companies/:companyId/trace/:lineageId
GET /companies/:companyId/trace/search?q=...
GET /companies/:companyId/documents/:type/:id/relationships
```

Link from any line table row to the trace detail view.

---

## Integration API keys (post-MVP UI)

External systems use `Authorization: Bearer chn_live_…` or `X-Api-Key` instead of user JWT. The integration admin UI is out of MVP scope but endpoints are documented in [API reference](./api-reference.md).

---

## Debugging checklist

1. Backend running? `curl http://localhost:3000/health`
2. Proxy working? Dev requests should go to `/api/v1/...` on the Vite origin
3. Headers present? Check `Authorization` and `X-Company-Id` in Network tab
4. Token expired? Refresh should happen automatically; check `/auth/refresh` response
5. Permission denied? Compare action with `effectivePermissions` from `/auth/me`
6. Types stale? Re-sync OpenAPI and run `npm run codegen`
