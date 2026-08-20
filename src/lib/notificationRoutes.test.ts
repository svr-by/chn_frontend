import { describe, expect, it } from 'vitest';

import { NotificationType } from '@/api/generated/models/notificationType';
import { resolveNotificationPath } from '@/lib/notificationRoutes';
import type { Notification } from '@/api/generated/models/notification';

describe('resolveNotificationPath', () => {
  it('routes supplier-facing "Request distributed" to inbound request page', () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      type: NotificationType.DOCUMENT_STATUS_CHANGED,
      documentType: 'MATERIAL_REQUEST',
      documentId: '00000000-0000-0000-0000-000000000050',
      commentId: null,
      documentEventId: 'REQUEST_DISTRIBUTED',
      partnerLinkId: null,
      title: 'Request distributed',
      body: null,
      readAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    } satisfies Notification;

    expect(resolveNotificationPath(notification)).toBe(
      '/app/requests/inbound/00000000-0000-0000-0000-000000000050',
    );
  });

  it('routes supplier-facing "Request distributed" to inbound even if documentEventId is null', () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      type: NotificationType.DOCUMENT_STATUS_CHANGED,
      documentType: 'MATERIAL_REQUEST',
      documentId: '00000000-0000-0000-0000-000000000050',
      commentId: null,
      documentEventId: null,
      partnerLinkId: null,
      title: 'Request distributed to suppliers',
      body: null,
      readAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    } satisfies Notification;

    expect(resolveNotificationPath(notification)).toBe(
      '/app/requests/inbound/00000000-0000-0000-0000-000000000050',
    );
  });

  it('keeps existing routing for partner invitation notifications', () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      type: NotificationType.PARTNER_INVITATION_RECEIVED,
      documentType: null,
      documentId: null,
      commentId: null,
      documentEventId: null,
      partnerLinkId: '00000000-0000-0000-0000-000000000031',
      title: 'Partner invitation',
      body: null,
      readAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    } satisfies Notification;

    expect(resolveNotificationPath(notification)).toBe(
      '/app/partners?tab=invitations&linkId=00000000-0000-0000-0000-000000000031',
    );
  });

  it('routes other MATERIAL_REQUEST notifications to outbound request page', () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      type: NotificationType.DOCUMENT_STATUS_CHANGED,
      documentType: 'MATERIAL_REQUEST',
      documentId: '00000000-0000-0000-0000-000000000050',
      commentId: null,
      documentEventId: null,
      partnerLinkId: null,
      title: 'Some other notification',
      body: null,
      readAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    } satisfies Notification;

    expect(resolveNotificationPath(notification)).toBe(
      '/app/requests/00000000-0000-0000-0000-000000000050',
    );
  });
});

