import { useSearchParams } from 'react-router-dom';

import { RegisterSuccessPage } from '@/features/auth/VerifyEmailPromptPage';

export function RegisterSuccessRoute() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? undefined;
  const inviteAccepted = searchParams.get('inviteAccepted') === '1';

  return <RegisterSuccessPage email={email} inviteAccepted={inviteAccepted} />;
}
