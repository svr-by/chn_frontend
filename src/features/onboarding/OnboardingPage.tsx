import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
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
  getInvitedMemberships,
} from '@/lib/permissions';
import { setActiveCompanyId } from '@/store/slices/authSlice';

const companySchema = z.object({
  name: z.string().min(1),
  taxId: z.string().optional(),
  country: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function OnboardingPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasRefreshToken });

  const invitedMemberships = getInvitedMemberships(data?.user);
  const activeMemberships = getActiveMemberships(data?.user);

  const [createCompany, createState] = useCreateCompanyMutation();
  const [acceptInvite, acceptState] = useAcceptInviteMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', taxId: '', country: '' },
  });

  useEffect(() => {
    if (activeMemberships.length > 0) {
      navigate('/app', { replace: true });
    }
  }, [activeMemberships.length, navigate]);

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
        country: values.country || undefined,
      }).unwrap();
      dispatch(setActiveCompanyId(result.company.id));
      enqueueSnackbar(t('companyCreated'), { variant: 'success' });
      navigate('/app');
    } catch {
      // ApiErrorAlert below
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 560 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {t('onboardingTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('onboardingSubtitle')}
          </Typography>

          <ApiErrorAlert error={createState.error ?? acceptState.error} />

          {invitedMemberships.length > 0 && (
            <Stack spacing={2} sx={{ mb: 4 }}>
              <Typography variant="h6">{t('pendingInvites')}</Typography>
              {invitedMemberships.map((membership) => (
                <Box
                  key={membership.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      {membership.company?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {membership.role}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    disabled={acceptState.isLoading}
                    onClick={() =>
                      void handleAccept(membership.company?.id ?? '')
                    }
                  >
                    {t('acceptInvite')}
                  </Button>
                </Box>
              ))}
            </Stack>
          )}

          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('createCompany')}
          </Typography>

          <Box
            component="form"
            onSubmit={(event) => void handleSubmit(onCreateCompany)(event)}
          >
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
            <TextField
              {...register('country')}
              label={t('country')}
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
        </CardContent>
      </Card>
    </Box>
  );
}
