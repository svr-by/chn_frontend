import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppHomePage } from '@/features/app/AppHomePage';
import { PlaceholderPage } from '@/features/app/PlaceholderPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { RegisterSuccessRoute } from '@/features/auth/RegisterSuccessRoute';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';
import { VerifyEmailPromptPage } from '@/features/auth/VerifyEmailPromptPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { TeamSettingsPage } from '@/features/settings/TeamSettingsPage';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AuthStandaloneLayout } from '@/layouts/AuthStandaloneLayout';
import { navConfig } from '@/lib/navConfig';
import { AuthBootstrap } from '@/routes/AuthBootstrap';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RootRedirect } from '@/routes/RootRedirect';

const TEAM_PATH = '/app/settings/team';

const stubRoutes = navConfig
  .filter((item) => item.path !== TEAM_PATH)
  .map((item) => ({
    path: item.path.replace('/app/', ''),
    element: <PlaceholderPage path={item.path} />,
  }));

export const router = createBrowserRouter([
  {
    element: <AuthBootstrap />,
    children: [
      {
        path: '/',
        element: <RootRedirect />,
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/verify-email', element: <VerifyEmailPage /> },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/register', element: <RegisterPage /> },
              { path: '/register/success', element: <RegisterSuccessRoute /> },
              { path: '/forgot-password', element: <ForgotPasswordPage /> },
              { path: '/reset-password', element: <ResetPasswordPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requireCompany={false} requireEmailVerified={false} />,
        children: [
          {
            element: <AuthStandaloneLayout />,
            children: [
              { path: '/verify-email-prompt', element: <VerifyEmailPromptPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requireCompany={false} />,
        children: [
          {
            element: <AuthStandaloneLayout />,
            children: [{ path: '/onboarding', element: <OnboardingPage /> }],
          },
        ],
      },
      {
        element: <ProtectedRoute requireCompany />,
        children: [
          {
            path: '/app',
            element: <AppLayout />,
            children: [
              { index: true, element: <AppHomePage /> },
              { path: 'settings/team', element: <TeamSettingsPage /> },
              ...stubRoutes,
            ],
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
