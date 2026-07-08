import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: {
        app: {
          title: 'CHN',
          home: 'Home',
          company: 'Company',
          logout: 'Log out',
          notifications: 'Notifications',
          welcome: 'Welcome, {{company}}',
          homeSubtitle:
            'Use the navigation to access procurement, finance, and logistics modules.',
          availableSections: 'Available sections',
          noSections: 'No sections are available for your current permissions.',
          comingSoon: 'This section will be available in Phase {{phase}}.',
        },
      },
      auth: {
        email: 'Email',
        password: 'Password',
        firstName: 'First name',
        lastName: 'Last name',
        passwordHint: 'Minimum 8 characters',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        login: 'Sign in',
        register: 'Create account',
        noAccount: 'Create an account',
        hasAccount: 'Already have an account? Sign in',
        loginSuccess: 'Signed in successfully',
        registerSuccess: 'Account created. Please sign in.',
        onboardingTitle: 'Get started',
        onboardingSubtitle:
          'Accept a pending invitation or create your company to continue.',
        pendingInvites: 'Pending invitations',
        acceptInvite: 'Accept',
        inviteAccepted: 'Invitation accepted',
        createCompany: 'Create a company',
        companyName: 'Company name',
        taxId: 'Tax ID',
        country: 'Country',
        createCompanyButton: 'Create company',
        companyCreated: 'Company created successfully',
      },
      nav: {
        requests: 'Requests',
        products: 'Products',
        quotes: 'Quotes',
        selections: 'Selections',
        invoices: 'Invoices',
        payments: 'Payments',
        shipping: 'Shipping invoices',
        consolidations: 'Consolidations',
        trace: 'Trace',
        partners: 'Partners',
        team: 'Team',
      },
      errors: {
        UNKNOWN_ERROR: 'Something went wrong. Please try again.',
        INVALID_CREDENTIALS: 'Invalid email or password.',
        EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
        VALIDATION_ERROR: 'Please check the form and try again.',
        UNAUTHORIZED: 'Your session has expired. Please sign in again.',
        INSUFFICIENT_PERMISSIONS: 'You do not have permission for this action.',
        MEMBER_NOT_INVITED: 'This invitation is no longer valid.',
        COMPANY_NOT_FOUND: 'Company not found.',
      },
    },
  },
  defaultNS: 'common',
  ns: ['common', 'auth', 'nav', 'errors'],
});

export default i18n;
