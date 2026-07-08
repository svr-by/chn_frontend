import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppHomePage } from '@/features/app/AppHomePage';
import { PlaceholderPage } from '@/features/app/PlaceholderPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { stubNavPaths } from '@/lib/navConfig';
import { AuthBootstrap } from '@/routes/AuthBootstrap';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RootRedirect } from '@/routes/RootRedirect';

const stubRoutes = stubNavPaths.map((path) => ({
  path: path.replace('/app/', ''),
  element: <PlaceholderPage path={path} />,
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
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/register', element: <RegisterPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requireCompany={false} />,
        children: [{ path: '/onboarding', element: <OnboardingPage /> }],
      },
      {
        element: <ProtectedRoute requireCompany />,
        children: [
          {
            path: '/app',
            element: <AppLayout />,
            children: [
              { index: true, element: <AppHomePage /> },
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
