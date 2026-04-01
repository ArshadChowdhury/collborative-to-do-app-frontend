'use client';

import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TenantProvider } from '@/contexts/TenantContext';
import { queryClient as defaultQueryClient } from '../lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers
 * ─────────
 * All client-side context providers in one place so the root layout
 * (a server component) stays clean and only renders this one client boundary.
 *
 * Order matters:
 *   TenantProvider  — sets up auth state & axios headers
 *   QueryClientProvider — React Query, needs to be outside components that
 *                         call useQuery/useMutation
 */
export function Providers({ children }: ProvidersProps) {
  // Stable QueryClient instance across HMR in dev without leaking between tests.
  // useState ensures a single instance per component tree.
  const [client] = useState(() => defaultQueryClient);

  return (
    <TenantProvider>
      <QueryClientProvider client={client}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </TenantProvider>
  );
}