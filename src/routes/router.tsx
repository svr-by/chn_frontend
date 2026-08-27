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
import { RequestDetailPage } from '@/features/requests/pages/requestDetailPage/RequestDetailPage';
import { QuoteDetailPage } from '@/features/quotes/pages/quoteDetailPage/QuoteDetailPage';
import { QuotesPage } from '@/features/quotes/pages/quotesPage/QuotesPage';
import { InvoicesPage } from '@/features/invoices/pages/invoicesPage/InvoicesPage';
import { InvoiceNewPage } from '@/features/invoices/pages/invoiceNewPage/InvoiceNewPage';
import { InvoiceDetailPage } from '@/features/invoices/pages/invoiceDetailPage/InvoiceDetailPage';
import { PaymentsPage } from '@/features/payments/pages/PaymentsPage';
import { PaymentDetailPage } from '@/features/payments/pages/PaymentDetailPage';
import { ShippingInvoicesPage } from '@/features/shipping/pages/ShippingInvoicesPage';
import { ShippingInvoiceDetailPage } from '@/features/shipping/pages/ShippingInvoiceDetailPage';
import { ConsolidationsPage } from '@/features/consolidations/pages/ConsolidationsPage';
import { ConsolidationDetailPage } from '@/features/consolidations/pages/ConsolidationDetailPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { TraceDetailPage } from '@/features/trace/pages/traceDetailPage/TraceDetailPage';
import { TraceSearchPage } from '@/features/trace/pages/traceSearchPage/TraceSearchPage';
import { RequestImportPage } from '@/features/imports/pages/RequestImportPage';
import { RequestLinesPage } from '@/features/requests/pages/requestLinesPage/RequestLinesPage';
import { RequestNewPage } from '@/features/requests/pages/requestNewPage/RequestNewPage';
import { RequestsPage } from '@/features/requests/pages/requestsPage/RequestsPage';
import { MemberAccessPage } from '@/features/settings/pages/memberAccessPage/MemberAccessPage';
import { TeamSettingsPage } from '@/features/settings/pages/teamSettingsPage/TeamSettingsPage';
import { IntegrationsSettingsPage } from '@/features/integrations/pages/IntegrationsSettingsPage';
import { ProfilePage } from '@/features/settings/pages/profilePage/ProfilePage';
import { HelpPage } from '@/features/help/pages/helpPage/HelpPage';
import { PartnersPage } from '@/features/partners/pages/PartnersPage';
import { AppLayout } from '@/layouts/appLayout/AppLayout';
import { AuthLayout } from '@/layouts/authLayout/AuthLayout';
import { navConfig } from '@/lib/navConfig';
import { AuthBootstrap } from '@/routes/AuthBootstrap';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RootRedirect } from '@/routes/RootRedirect';

const TEAM_PATH = '/app/settings/team';
const INTEGRATIONS_PATH = '/app/settings/integrations';
const PARTNERS_PATH = '/app/partners';
const PRODUCTS_PATH = '/app/products';
const REQUESTS_PATH = '/app/requests';
const REQUEST_LINES_PATH = '/app/request-lines';

const QUOTES_PATH = '/app/quotes';
const INVOICES_PATH = '/app/invoices';
const PAYMENTS_PATH = '/app/payments';
const SHIPPING_INVOICES_PATH = '/app/shipping-invoices';
const CONSOLIDATIONS_PATH = '/app/consolidations';
const TRACE_PATH = '/app/trace';

const stubRoutes = navConfig
  .filter(
    (item) =>
      ![
        TEAM_PATH,
        INTEGRATIONS_PATH,
        PARTNERS_PATH,
        PRODUCTS_PATH,
        REQUESTS_PATH,
        REQUEST_LINES_PATH,
        QUOTES_PATH,
        INVOICES_PATH,
        PAYMENTS_PATH,
        SHIPPING_INVOICES_PATH,
        CONSOLIDATIONS_PATH,
        TRACE_PATH,
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
        children: [{ path: '/verify-email', element: <VerifyEmailPage /> }],
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
            element: <AuthLayout variant="plain" />,
            children: [
              {
                path: '/verify-email-prompt',
                element: <VerifyEmailPromptPage />,
              },
              { path: '/access-suspended', element: <AccessSuspendedPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requireCompany={false} />,
        children: [
          {
            element: <AuthLayout variant="plain" />,
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
              { path: 'request-lines', element: <RequestLinesPage /> },
              { path: 'requests/import', element: <RequestImportPage /> },
              { path: 'requests/new', element: <RequestNewPage /> },
              {
                path: 'requests/inbound',
                element: <Navigate to="/app/requests?tab=inbound" replace />,
              },
              {
                path: 'requests/inbound/:requestId',
                element: <RequestDetailPage />,
              },
              { path: 'requests/:requestId', element: <RequestDetailPage /> },
              { path: 'quotes', element: <QuotesPage /> },
              { path: 'quotes/:quoteId', element: <QuoteDetailPage /> },
              { path: 'invoices', element: <InvoicesPage /> },
              { path: 'invoices/new', element: <InvoiceNewPage /> },
              { path: 'invoices/:invoiceId', element: <InvoiceDetailPage /> },
              { path: 'payments', element: <PaymentsPage /> },
              { path: 'payments/:paymentId', element: <PaymentDetailPage /> },
              { path: 'shipping-invoices', element: <ShippingInvoicesPage /> },
              {
                path: 'shipping-invoices/:shippingInvoiceId',
                element: <ShippingInvoiceDetailPage />,
              },
              { path: 'consolidations', element: <ConsolidationsPage /> },
              {
                path: 'consolidations/:consolidationId',
                element: <ConsolidationDetailPage />,
              },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'trace', element: <TraceSearchPage /> },
              { path: 'trace/:lineageId', element: <TraceDetailPage /> },
              { path: 'settings/team', element: <TeamSettingsPage /> },
              {
                path: 'settings/team/:memberId',
                element: <MemberAccessPage />,
              },
              {
                path: 'settings/integrations',
                element: <IntegrationsSettingsPage />,
              },
              { path: 'settings/profile', element: <ProfilePage /> },
              { path: 'help', element: <HelpPage /> },
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
