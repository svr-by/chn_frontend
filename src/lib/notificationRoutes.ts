import type { Notification } from '@/api/generated/models/notification';
import { NotificationType } from '@/api/generated/models/notificationType';
import {
  resolveDocumentPath,
  type DocumentDetailTab,
} from '@/lib/documentRoutes';

export function resolveNotificationPath(
  notification: Notification,
  options?: { tab?: DocumentDetailTab },
): string | null {
  if (
    notification.type === NotificationType.PARTNER_INVITATION_RECEIVED &&
    notification.partnerLinkId
  ) {
    return `/app/partners?tab=inbound&linkId=${notification.partnerLinkId}`;
  }

  return resolveDocumentPath(
    notification.documentType,
    notification.documentId,
    {
      tab:
        options?.tab ??
        (notification.type === NotificationType.COMMENT_ADDED
          ? 'comments'
          : undefined),
    },
  );
}
