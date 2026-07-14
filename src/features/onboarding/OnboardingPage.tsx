import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useAcceptInviteMutation,
  useCreateCompanyMutation,
} from '@/api/endpoints/companiesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { authStorage } from '@/lib/authStorage';
import {
  getActiveMemberships,
  getPendingInvitations,
} from '@/lib/permissions';
import { setActiveCompanyId } from '@/store/slices/authSlice';

const companySchema = z.object({
  name: z.string().min(3),
  taxId: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function OnboardingPage() {
  const { t } = useTranslation(['auth', 'enums']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasRefreshToken });

  const pendingInvitations = getPendingInvitations(data?.user);
  const activeMemberships = getActiveMemberships(data?.user);
  const hasPendingInvites = pendingInvitations.length > 0;
  const [tab, setTab] = useState(0);

  const [createCompany, createState] = useCreateCompanyMutation();
  const [acceptInvite, acceptState] = useAcceptInviteMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', taxId: '' },
  });

  useEffect(() => {
    if (activeMemberships.length > 0) {
      navigate('/app', { replace: true });
    }
  }, [activeMemberships.length, navigate]);

  useEffect(() => {
    if (!hasPendingInvites) {
      setTab(0);
    }
  }, [hasPendingInvites]);

  async function handleAccept(companyId: string) {
    try {
      await acceptInvite(companyId).unwrap();
      dispatch(setActiveCompanyId(companyId));
      enqueueSnackbar(t('inviteAccepted'), { variant: 'success' });
      navigate('/app');
    } catch {
      // ApiErrorAlert below
    }
  }

  async function onCreateCompany(values: CompanyFormValues) {
    try {
      const result = await createCompany({
        name: values.name,
        taxId: values.taxId || undefined,
      }).unwrap();
      dispatch(setActiveCompanyId(result.company.id));
      enqueueSnackbar(t('companyCreated'), { variant: 'success' });
      navigate('/app');
    } catch {
      // ApiErrorAlert below
    }
  }

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom textAlign="center">
            {t('onboardingTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
            {t('onboardingSubtitle')}
          </Typography>

          <ApiErrorAlert error={createState.error ?? acceptState.error} />

          {hasPendingInvites && (
            <Tabs
              value={tab}
              onChange={(_event, value: number) => setTab(value)}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label={t('pendingInvites')} />
              <Tab label={t('createCompany')} />
            </Tabs>
          )}

          {hasPendingInvites && tab === 0 && (
            <Stack spacing={2}>
              {pendingInvitations.map((invitation) => (
                <Box
                  key={invitation.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      {invitation.company.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(`memberRole.${invitation.role.toLowerCase()}`, {
                        ns: 'enums',
                      })}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {invitation.expired && (
                      <Chip
                        label={t('inviteExpired')}
                        size="small"
                        color="default"
                      />
                    )}
                    <Button
                      variant="outlined"
                      disabled={acceptState.isLoading || invitation.expired}
                      onClick={() => void handleAccept(invitation.company.id)}
                    >
                      {t('acceptInvite')}
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          {(!hasPendingInvites || tab === 1) && (
            <Box
              component="form"
              onSubmit={(event) => void handleSubmit(onCreateCompany)(event)}
            >
              {!hasPendingInvites && (
                <Typography variant="h6" sx={{ mb: 2 }} textAlign="center">
                  {t('createCompany')}
                </Typography>
              )}
              <TextField
                {...register('name')}
                label={t('companyName')}
                fullWidth
                margin="normal"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <TextField
                {...register('taxId')}
                label={t('taxId')}
                fullWidth
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={createState.isLoading}
              >
                {t('createCompanyButton')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
  );
}
