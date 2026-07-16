/**
 * Frontend-only helpers and thin aliases onto Orval-generated backend types.
 * Do not hand-maintain backend enums/DTOs here — re-export from `@/api/generated/models`.
 */

// --- Frontend-only primitives ---
export type DecimalString = string; // "10", "10.5", up to 4 decimal places

// --- Backend-owned types (generated) ---
export type { CompanyMemberEffectivePermissionsItem as Permission } from '@/api/generated/models/companyMemberEffectivePermissionsItem';
export { CompanyMemberEffectivePermissionsItem as PermissionValues } from '@/api/generated/models/companyMemberEffectivePermissionsItem';

export type { GetAuthMe200UserMembershipsItem as MembershipSummary } from '@/api/generated/models/getAuthMe200UserMembershipsItem';

export type { GetAuthMe200UserPendingInvitationsItem as PendingInvitation } from '@/api/generated/models/getAuthMe200UserPendingInvitationsItem';

export type { CompanyMemberRole as MemberRole } from '@/api/generated/models/companyMemberRole';
export { CompanyMemberRole as MemberRoleValues } from '@/api/generated/models/companyMemberRole';

export type { MaterialRequestStatus } from '@/api/generated/models/materialRequestStatus';
export { MaterialRequestStatus as MaterialRequestStatusValues } from '@/api/generated/models/materialRequestStatus';

export type { CommentDocumentType as DocumentType } from '@/api/generated/models/commentDocumentType';
export { CommentDocumentType as DocumentTypeValues } from '@/api/generated/models/commentDocumentType';

export type { ErrorResponse as ApiError } from '@/api/generated/models/errorResponse';
