import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Link,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import type { DocumentRelationshipsNodesItem } from '@/api/generated/models/documentRelationshipsNodesItem';
import { useGetDocumentRelationshipsQuery } from '@/api/endpoints/traceApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import {
  buildRelatedGraphView,
  getRelationshipNodeLabel,
} from '@/lib/documentRelationships';
import { resolveDocumentPath } from '@/lib/documentRoutes';
import { getDocumentStatusLabel } from '@/lib/traceLabels';

interface DocumentRelatedPanelProps {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
}

export function DocumentRelatedPanel({
  companyId,
  documentType,
  documentId,
}: DocumentRelatedPanelProps) {
  const { t } = useTranslation(['trace', 'enums']);

  const relationshipsQuery = useGetDocumentRelationshipsQuery(
    { companyId, documentType, documentId },
    { skip: !companyId || !documentId },
  );

  const graph = relationshipsQuery.data;

  if (relationshipsQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (relationshipsQuery.error) {
    return <ApiErrorAlert error={relationshipsQuery.error as never} />;
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('related.empty')}
      </Typography>
    );
  }

  const { stages } = buildRelatedGraphView(graph, documentId);
  const activeStep = stages.reduce(
    (lastIndex, stage, index) =>
      stage.nodes.some((node) => node.id === documentId) ? index : lastIndex,
    0,
  );

  return (
    <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
      {stages.map((stage) => {
        const typeLabel = t(`related.documentTypes.${stage.documentType}`, {
          defaultValue: stage.documentType,
        });

        return (
          <Step key={stage.documentType} expanded>
            <StepLabel>
              <Typography variant="subtitle1">{typeLabel}</Typography>
            </StepLabel>
            <StepContent>
              <Stack spacing={1.5} sx={{ pb: 2 }}>
                {stage.nodes.map((node) => (
                  <RelatedNodeCard
                    key={node.id}
                    node={node}
                    typeLabel={typeLabel}
                    isCurrent={node.id === documentId}
                  />
                ))}
              </Stack>
            </StepContent>
          </Step>
        );
      })}
    </Stepper>
  );
}

interface RelatedNodeCardProps {
  node: DocumentRelationshipsNodesItem;
  typeLabel: string;
  isCurrent: boolean;
}

function RelatedNodeCard({
  node,
  typeLabel,
  isCurrent,
}: RelatedNodeCardProps) {
  const { t } = useTranslation(['trace', 'enums']);
  const path = resolveDocumentPath(node.documentType, node.id);
  const label = getRelationshipNodeLabel(node, typeLabel);
  const showCompanyName =
    Boolean(node.companyName) && node.companyName !== label;
  const statusLabel = node.status
    ? getDocumentStatusLabel(node.documentType, node.status, t)
    : null;

  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 420,
        borderColor: isCurrent ? 'primary.main' : undefined,
        bgcolor: isCurrent ? 'action.selected' : undefined,
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            {path && !isCurrent ? (
              <Link
                component={RouterLink}
                to={path}
                underline="hover"
                fontWeight={600}
              >
                {label}
              </Link>
            ) : (
              <Typography fontWeight={600}>{label}</Typography>
            )}

            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {isCurrent ? (
                <Chip
                  label={t('related.current')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : null}
              {statusLabel ? (
                <Chip label={statusLabel} size="small" variant="outlined" />
              ) : null}
            </Stack>
          </Stack>

          {showCompanyName ? (
            <Typography variant="body2" color="text.secondary">
              {node.companyName}
            </Typography>
          ) : null}

          {node.createdBy?.name ? (
            <Typography variant="body2" color="text.secondary">
              {t('related.createdBy', { name: node.createdBy.name })}
            </Typography>
          ) : null}

          {node.createdAt ? (
            <Typography variant="body2" color="text.secondary">
              {t('related.createdAt', {
                date: new Date(node.createdAt).toLocaleDateString(),
              })}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
