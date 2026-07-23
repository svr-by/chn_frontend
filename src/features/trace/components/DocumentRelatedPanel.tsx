import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import { useGetDocumentRelationshipsQuery } from '@/api/endpoints/traceApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { resolveDocumentPath } from '@/lib/documentRoutes';
import {
  getDocumentStatusLabel,
  getRelationLabel,
} from '@/lib/traceLabels';

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
  const navigate = useNavigate();

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

  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
        }}
      >
        {graph.nodes.map((node) => {
          const path = resolveDocumentPath(node.documentType, node.id);
          return (
            <Card key={node.id} variant="outlined">
              <CardActionArea
                disabled={!path}
                onClick={() => {
                  if (path) {
                    navigate(path);
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="subtitle2">{t(`related.documentTypes.${node.documentType}`, {
                          defaultValue: node.documentType,
                        })} {node.label}</Typography>
                    {node.status ? (
                      <Chip
                        label={getDocumentStatusLabel(
                          node.documentType,
                          node.status,
                          t,
                        )}
                        size="small"
                      />
                    ) : null}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {graph.edges.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2">
            {t('related.connections')}
          </Typography>
          {graph.edges.map((edge) => {
            const from = nodeById.get(edge.fromId);
            const to = nodeById.get(edge.toId);
            return (
              <Typography
                key={`${edge.fromId}-${edge.toId}-${edge.relation}`}
                variant="body2"
                color="text.secondary"
              >
                {t('related.edgeFormat', {
                  from: from?.label ?? edge.fromId.slice(0, 8),
                  to: to?.label ?? edge.toId.slice(0, 8),
                  relation: getRelationLabel(edge.relation, t),
                })}
              </Typography>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
}
