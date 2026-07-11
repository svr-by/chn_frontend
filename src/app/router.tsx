import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppHomePage } from '@/features/app/AppHomePage';
import { PlaceholderPage } from '@/features/app/PlaceholderPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { AccessSuspendedPage } from '@/features/auth/AccessSuspendedPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { RegisterSuccessRoute } from '@/features/auth/RegisterSuccessRoute';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';
import { VerifyEmailPromptPage } from '@/features/auth/VerifyEmailPromptPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { RequestDetailPage } from '@/features/requests/pages/RequestDetailPage';
import { InboundRequestsPage } from '@/features/requests/pages/InboundRequestsPage';
import { QuoteComparisonPage } from '@/features/quotes/pages/QuoteComparisonPage';
import { QuoteDetailPage } from '@/features/quotes/pages/QuoteDetailPage';
import { QuotesPage } from '@/features/quotes/pages/QuotesPage';
import { RequestImportPage } from '@/features/imports/pages/RequestImportPage';
import { RequestNewPage } from '@/features/requests/pages/RequestNewPage';
import { RequestsPage } from '@/features/requests/pages/RequestsPage';
import { TeamSettingsPage } from '@/features/settings/TeamSettingsPage';
import { ProfilePage } from '@/features/settings/ProfilePage';
import { PartnersPage } from '@/features/partners/pages/PartnersPage';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AuthStandaloneLayout } from '@/layouts/AuthStandaloneLayout';
import { navConfig } from '@/lib/navConfig';
import { AuthBootstrap } from '@/routes/AuthBootstrap';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RootRedirect } from '@/routes/RootRedirect';

const TEAM_PATH = '/app/settings/team';
const PARTNERS_PATH = '/app/partners';
const PRODUCTS_PATH = '/app/products';
const REQUESTS_PATH = '/app/requests';

const QUOTES_PATH = '/app/quotes';

const stubRoutes = navConfig
  .filter(
    (item) =>
      ![
        TEAM_PATH,
        PARTNERS_PATH,
        PRODUCTS_PATH,
        REQUESTS_PATH,
        QUOTES_PATH,
      ].includes(item.path),
  )
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
        element: <ProtectedRoute requireCompany={false} allowSuspended />,
        children: [
          {
            element: <AuthStandaloneLayout />,
            children: [
              { path: '/verify-email-prompt', element: <VerifyEmailPromptPage /> },
              { path: '/access-suspended', element: <AccessSuspendedPage /> },
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
              { path: 'partners', element: <PartnersPage /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'requests', element: <RequestsPage /> },
              { path: 'requests/import', element: <RequestImportPage /> },
              { path: 'requests/new', element: <RequestNewPage /> },
              { path: 'requests/inbound', element: <InboundRequestsPage /> },
              {
                path: 'requests/:requestId/compare',
                element: <QuoteComparisonPage />,
              },
              { path: 'requests/:requestId', element: <RequestDetailPage /> },
              { path: 'quotes', element: <QuotesPage /> },
              { path: 'quotes/:quoteId', element: <QuoteDetailPage /> },
              { path: 'trace/:lineageId', element: <PlaceholderPage path="/app/trace" /> },
              { path: 'settings/team', element: <TeamSettingsPage /> },
              { path: 'settings/profile', element: <ProfilePage /> },
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
