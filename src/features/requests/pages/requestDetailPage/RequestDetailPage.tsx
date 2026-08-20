import { useEffect } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useGetInboundRequestQuery,
  useGetRequestQuery,
} from '@/api/endpoints/requestsApi';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/documentDetailLayout/DocumentDetailLayout';
import {
  DocumentDetailMeta,
  DocumentDetailMetaItem,
  DocumentDetailMetaRow,
} from '@/layouts/documentDetailLayout/DocumentDetailMeta';
import { DocumentStatusProgress } from '@/components/status/documentStatusProgress/DocumentStatusProgress';
import {
  RequestAssigneeEditButton,
  RequestDueDateEditButton,
  RequestNotesEditButton,
  RequestPriorityEditButton,
  RequestTitleEditButton,
} from '@/features/requests/components/requestHeaderForm/RequestHeaderForm';
import { InboundRequestStatusActions } from '@/features/requests/components/inboundRequestStatusActions/InboundRequestStatusActions';
import { RequestLinesTable } from '@/features/requests/components/requestLinesTable/RequestLinesTable';
import { RequestSuppliersMatrix } from '@/features/requests/components/requestSuppliersMatrix/RequestSuppliersMatrix';
import { RequestStatusActions } from '@/features/requests/components/requestStatusActions/RequestStatusActions';
import { QuoteComparisonMatrix } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { MATERIAL_REQUEST_STATUS_FLOW } from '@/lib/documentStatusFlows';

export function RequestDetailPage() {
  const { t } = useTranslation(['requests', 'enums']);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { requestId } = useParams<{ requestId: string }>();
  const isInbound = Boolean(useMatch('/app/requests/inbound/:requestId'));
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const outboundQuery = useGetRequestQuery(
    { companyId: companyId ?? '', requestId: requestId ?? '' },
    { skip: !companyId || !requestId || isInbound },
  );

  const inboundQuery = useGetInboundRequestQuery(
    { companyId: companyId ?? '', requestId: requestId ?? '' },
    { skip: !companyId || !requestId || !isInbound },
  );

  const requestQuery = isInbound ? inboundQuery : outboundQuery;
  const outboundRequest = outboundQuery.data?.request;
  const inboundRequest = inboundQuery.data?.request;
  const request = isInbound ? inboundRequest : outboundRequest;
  const canEdit =
    !isInbound &&
    hasPermission('manageRequests') &&
    outboundRequest?.status !== 'CLOSED';

  useEffect(() => {
    if (
      requestQuery.isError &&
      'status' in requestQuery.error &&
      requestQuery.error.status === 404
    ) {
      enqueueSnackbar(
        t(isInbound ? 'inbound.toast.notFound' : 'toast.notFound'),
        { variant: 'error' },
      );
      navigate(isInbound ? '/app/requests?tab=inbound' : '/app/requests', {
        replace: true,
      });
    }
  }, [
    requestQuery.isError,
    requestQuery.error,
    isInbound,
    enqueueSnackbar,
    navigate,
    t,
  ]);

  if (!companyId || !requestId) {
    return null;
  }

  const title =
    request?.title ?? t('detail.fallbackTitle', { id: requestId.slice(0, 8) });
  const listFallback = isInbound
    ? '/app/requests?tab=inbound'
    : '/app/requests';

  return (
    <DocumentDetailLayout
      maxWidth="fluid"
      title={t('detail.title', { title })}
      titleAction={
        outboundRequest && canEdit ? (
          <RequestTitleEditButton
            companyId={companyId}
            request={outboundRequest}
          />
        ) : null
      }
      statusBadge={
        request?.status ? (
          <DocumentStatusProgress
            currentStatus={request.status}
            steps={MATERIAL_REQUEST_STATUS_FLOW.steps}
            enumKey={MATERIAL_REQUEST_STATUS_FLOW.enumKey}
          />
        ) : undefined
      }
      loading={requestQuery.isLoading}
      error={requestQuery.error}
      backFallbackTo={listFallback}
      actionMenuItems={
        request ? (
          isInbound ? (
            <InboundRequestStatusActions
              companyId={companyId}
              requestId={request.id}
              requestTitle={request.title}
              buyerName={inboundRequest?.buyerCompany.name}
            />
          ) : (
            <RequestStatusActions
              companyId={companyId}
              requestId={request.id}
              status={request.status}
              requestLines={request.lines}
            />
          )
        ) : null
      }
      meta={
        request ? (
          <DocumentDetailMeta>
            <DocumentDetailMetaRow spacing={1.5}>
              {isInbound && inboundRequest ? (
                <DocumentDetailMetaItem
                  icon={<BusinessOutlinedIcon />}
                  label={t('inbound.columns.buyer')}
                  value={inboundRequest.buyerCompany.name}
                />
              ) : null}
              {!isInbound && request.createdBy?.name ? (
                <DocumentDetailMetaItem
                  icon={<PersonOutlineOutlinedIcon />}
                  value={t('detail.createdBy', {
                    name: request.createdBy.name,
                  })}
                />
              ) : null}
              {request.submittedAt ? (
                <DocumentDetailMetaItem
                  icon={<ScheduleOutlinedIcon />}
                  value={t('detail.submittedAt', {
                    date: new Date(request.submittedAt).toLocaleDateString(),
                  })}
                />
              ) : null}
              {isInbound && inboundRequest?.distributedAt ? (
                <DocumentDetailMetaItem
                  icon={<ScheduleOutlinedIcon />}
                  label={t('inbound.columns.distributedAt')}
                  value={new Date(
                    inboundRequest.distributedAt,
                  ).toLocaleDateString()}
                />
              ) : null}
            </DocumentDetailMetaRow>

            <DocumentDetailMetaRow>
              <DocumentDetailMetaItem
                icon={<AssignmentIndOutlinedIcon />}
                label={t('form.assignee')}
                value={
                  request.assignee?.name ?? t('form.assigneeUnassigned')
                }
                action={
                  outboundRequest && canEdit ? (
                    <RequestAssigneeEditButton
                      companyId={companyId}
                      request={outboundRequest}
                    />
                  ) : null
                }
              />
              {Boolean(request.dueDate) || canEdit ? (
                <DocumentDetailMetaItem
                  icon={<EventOutlinedIcon />}
                  label={t('form.dueDate')}
                  value={
                    request.dueDate
                      ? new Date(request.dueDate).toLocaleDateString()
                      : undefined
                  }
                  action={
                    outboundRequest && canEdit ? (
                      <RequestDueDateEditButton
                        companyId={companyId}
                        request={outboundRequest}
                      />
                    ) : null
                  }
                />
              ) : null}
              <DocumentDetailMetaItem
                icon={<FlagOutlinedIcon />}
                label={t('form.priority')}
                value={t(
                  `enums:materialRequestPriority.${request.priority.toLowerCase()}`,
                )}
                action={
                  outboundRequest && canEdit ? (
                    <RequestPriorityEditButton
                      companyId={companyId}
                      request={outboundRequest}
                    />
                  ) : null
                }
              />
              {Boolean(request.notes) || canEdit ? (
                <DocumentDetailMetaItem
                  icon={<NotesOutlinedIcon />}
                  label={t('form.notes')}
                  value={request.notes ?? undefined}
                  valueClampLines={request.notes ? 2 : undefined}
                  action={
                    outboundRequest && canEdit ? (
                      <RequestNotesEditButton
                        companyId={companyId}
                        request={outboundRequest}
                      />
                    ) : null
                  }
                />
              ) : null}
            </DocumentDetailMetaRow>
          </DocumentDetailMeta>
        ) : null
      }
    >
      {request ? (
        <Stack spacing={3}>
          <DocumentDetailTabs
            companyId={companyId}
            documentType="MATERIAL_REQUEST"
            documentId={request.id}
            enableComments={false}
            extraTabs={
              isInbound
                ? [
                    {
                      value: 'details',
                      label: t('tabs.details'),
                      panel: (
                        <RequestLinesTable
                          companyId={companyId}
                          requestId={request.id}
                          lines={request.lines}
                          editable={false}
                        />
                      ),
                    },
                  ]
                : [
                    {
                      value: 'details',
                      label: t('tabs.details'),
                      panel: (
                        <Stack spacing={3}>
                          <RequestLinesTable
                            companyId={companyId}
                            requestId={request.id}
                            lines={request.lines}
                            editable={canEdit}
                          />
                        </Stack>
                      ),
                    },
                    {
                      value: 'suppliers',
                      label: t('tabs.suppliers'),
                      panel: (
                        <RequestSuppliersMatrix
                          companyId={companyId}
                          requestId={request.id}
                          requestLines={request.lines}
                          requestStatus={request.status}
                        />
                      ),
                    },
                    {
                      value: 'quotes',
                      label: t('tabs.quotes'),
                      panel: (
                        <QuoteComparisonMatrix
                          companyId={companyId}
                          requestId={request.id}
                        />
                      ),
                    },
                  ]
            }
          />
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
