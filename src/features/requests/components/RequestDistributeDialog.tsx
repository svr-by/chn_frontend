import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Link,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { useDistributeRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import type { RequestLine } from '@/api/generated/models/requestLine';

export interface DistributePrefill {
  supplierCompanyId: string;
  requestLineIds: string[];
}

interface RequestDistributeDialogProps {
  open: boolean;
  companyId: string;
  requestId: string;
  requestLines: RequestLine[];
  initialDistributions?: DistributePrefill[];
  /** When set (and no initialDistributions), newly selected suppliers get these lines. */
  initialRequestLineIds?: string[];
  onClose: () => void;
  onDistributed?: () => void;
}

type LineAssignments = Record<string, Set<string>>;

function buildAssignmentsFromPrefill(
  prefill: DistributePrefill[] | undefined,
): LineAssignments {
  if (!prefill?.length) {
    return {};
  }

  return prefill.reduce<LineAssignments>((acc, item) => {
    acc[item.supplierCompanyId] = new Set(item.requestLineIds);
    return acc;
  }, {});
}

export function RequestDistributeDialog({
  open,
  companyId,
  requestId,
  requestLines,
  initialDistributions,
  initialRequestLineIds,
  onClose,
  onDistributed,
}: RequestDistributeDialogProps) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [lineAssignments, setLineAssignments] = useState<LineAssignments>({});
  const [createProducts, setCreateProducts] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const defaultLineIds = useMemo(() => {
    if (initialRequestLineIds?.length) {
      const allowed = new Set(requestLines.map((line) => line.id));
      return initialRequestLineIds.filter((id) => allowed.has(id));
    }
    return requestLines.map((line) => line.id);
  }, [initialRequestLineIds, requestLines]);

  const partnersQuery = useListPartnersQuery(
    { companyId },
    { skip: !open || !companyId },
  );

  const [distributeRequest, distributeState] = useDistributeRequestMutation();

  const activePartners = useMemo(
    () =>
      (partnersQuery.data?.partners ?? []).filter(
        (partner) => partner.status === 'ACTIVE',
      ),
    [partnersQuery.data?.partners],
  );

  const partnerNameById = useMemo(
    () =>
      new Map(
        activePartners.map((partner) => [partner.company.id, partner.company.name]),
      ),
    [activePartners],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const prefill = initialDistributions ?? [];
    const supplierIds = prefill.map((item) => item.supplierCompanyId);
    setSelectedSupplierIds(supplierIds);
    setLineAssignments(buildAssignmentsFromPrefill(prefill));
    setCreateProducts(false);
    setValidationError(null);
  }, [open, initialDistributions]);

  function toggleSupplier(supplierCompanyId: string) {
    setValidationError(null);
    setSelectedSupplierIds((current) => {
      const isSelected = current.includes(supplierCompanyId);
      if (isSelected) {
        setLineAssignments((assignments) => {
          const next = { ...assignments };
          delete next[supplierCompanyId];
          return next;
        });
        return current.filter((id) => id !== supplierCompanyId);
      }

      setLineAssignments((assignments) => ({
        ...assignments,
        [supplierCompanyId]: new Set(defaultLineIds),
      }));
      return [...current, supplierCompanyId];
    });
  }

  function toggleLineForSupplier(supplierCompanyId: string, lineId: string) {
    setValidationError(null);
    setLineAssignments((assignments) => {
      const current = new Set(assignments[supplierCompanyId] ?? []);
      if (current.has(lineId)) {
        current.delete(lineId);
      } else {
        current.add(lineId);
      }
      return { ...assignments, [supplierCompanyId]: current };
    });
  }

  async function handleDistribute() {
    if (selectedSupplierIds.length === 0) {
      setValidationError(t('distribute.validation.supplierRequired'));
      return;
    }

    const distributions = selectedSupplierIds.map((supplierCompanyId) => ({
      supplierCompanyId,
      requestLineIds: Array.from(lineAssignments[supplierCompanyId] ?? []),
    }));

    const emptySupplier = distributions.find(
      (item) => item.requestLineIds.length === 0,
    );
    if (emptySupplier) {
      const name =
        partnerNameById.get(emptySupplier.supplierCompanyId) ??
        emptySupplier.supplierCompanyId;
      setValidationError(
        t('distribute.validation.linesRequired', { supplier: name }),
      );
      return;
    }

    await distributeRequest({
      companyId,
      requestId,
      createProducts,
      distributions,
    }).unwrap();

    enqueueSnackbar(t('distribute.toast.success'), { variant: 'success' });
    setSelectedSupplierIds([]);
    setLineAssignments({});
    setCreateProducts(false);
    setValidationError(null);
    onDistributed?.();
    onClose();
  }

  function handleClose() {
    setSelectedSupplierIds([]);
    setLineAssignments({});
    setCreateProducts(false);
    setValidationError(null);
    onClose();
  }

  const unassignedLineCount = requestLines.filter((line) =>
    selectedSupplierIds.every(
      (supplierId) => !lineAssignments[supplierId]?.has(line.id),
    ),
  ).length;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{t('distribute.title')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={distributeState.error} />
        <Typography sx={{ mb: 2 }}>{t('distribute.message')}</Typography>

        {partnersQuery.isLoading ? (
          <Typography color="text.secondary">{t('distribute.loading')}</Typography>
        ) : activePartners.length === 0 ? (
          <Stack spacing={1}>
            <Typography color="text.secondary">
              {t('distribute.empty')}
            </Typography>
            <Link component={RouterLink} to="/app/partners" underline="hover">
              {t('distribute.goToPartners')}
            </Link>
          </Stack>
        ) : (
          <FormGroup sx={{ mb: 3 }}>
            {activePartners.map((partner) => (
              <FormControlLabel
                key={partner.id}
                control={
                  <Checkbox
                    checked={selectedSupplierIds.includes(partner.company.id)}
                    onChange={() => toggleSupplier(partner.company.id)}
                  />
                }
                label={partner.company.name}
              />
            ))}
          </FormGroup>
        )}

        {selectedSupplierIds.length > 0 && requestLines.length > 0 ? (
          <Box sx={{ overflowX: 'auto', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('distribute.lineAssignment')}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('columns.lineNumber')}</TableCell>
                  <TableCell>{t('columns.description')}</TableCell>
                  {selectedSupplierIds.map((supplierId) => (
                    <TableCell key={supplierId} align="center">
                      {partnerNameById.get(supplierId) ?? supplierId}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {requestLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.lineNumber}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    {selectedSupplierIds.map((supplierId) => (
                      <TableCell key={supplierId} align="center">
                        <Checkbox
                          size="small"
                          checked={lineAssignments[supplierId]?.has(line.id) ?? false}
                          onChange={() =>
                            toggleLineForSupplier(supplierId, line.id)
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {unassignedLineCount > 0 ? (
              <Typography variant="body2" color="warning.main">
                {t('distribute.unassignedWarning', {
                  count: unassignedLineCount,
                })}
              </Typography>
            ) : null}
          </Box>
        ) : null}

        <FormControlLabel
          control={
            <Switch
              checked={createProducts}
              onChange={(event) => setCreateProducts(event.target.checked)}
            />
          }
          label={t('distribute.createProducts')}
        />

        {validationError ? (
          <FormHelperText error sx={{ mt: 1 }}>
            {validationError}
          </FormHelperText>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('actions.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => void handleDistribute()}
          disabled={
            distributeState.isLoading ||
            selectedSupplierIds.length === 0 ||
            requestLines.length === 0 ||
            activePartners.length === 0
          }
        >
          {t('actions.distribute')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
