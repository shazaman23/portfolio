import type { RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { ExperiencePage } from './pages/ExperiencePage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

// The same paths as the Laravel site. CloudFront's viewer-request function
// serves index.html for any path without a file extension.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'experience/:id', element: <ExperiencePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
