import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { BASENAME, Providers, createQueryClient, routes } from './App';
import './styles.css';

const router = createBrowserRouter(routes, { basename: BASENAME });
const queryClient = createQueryClient();

createRoot(document.getElementById('redaktion')!).render(
  <StrictMode>
    <Providers client={queryClient}>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
