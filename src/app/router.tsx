import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '@/App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);
