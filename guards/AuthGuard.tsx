'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to /login. */
  redirectTo?: string;
  /**
   * Set to true for auth pages (login/signup).
   * Redirects *authenticated* users away to `redirectTo` (default: /dashboard).
   */
  guestOnly?: boolean;
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <svg
          className="w-8 h-8 animate-spin text-indigo-500"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-gray-500 text-sm">Loading workspace…</p>
      </div>
    </div>
  );
}

/**
 * AuthGuard
 * ─────────
 * Wraps any page or layout segment to enforce authentication state.
 *
 * Usage — protect a route:
 *   <AuthGuard>...</AuthGuard>
 *
 * Usage — redirect logged-in users away from auth pages:
 *   <AuthGuard guestOnly redirectTo="/dashboard">...</AuthGuard>
 */
export function AuthGuard({
  children,
  redirectTo,
  guestOnly = false,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Wait for rehydration before deciding

    if (guestOnly && isAuthenticated) {
      // Already logged in — bounce to dashboard (or caller's redirectTo)
      router.replace(redirectTo ?? '/dashboard');
      return;
    }

    if (!guestOnly && !isAuthenticated) {
      // Not logged in — bounce to login, preserving the intended destination
      const returnTo = pathname !== '/' ? `?returnTo=${encodeURIComponent(pathname)}` : '';
      router.replace(`${redirectTo ?? '/login'}${returnTo}`);
    }
  }, [isAuthenticated, isLoading, guestOnly, redirectTo, router, pathname]);

  // Show spinner while TenantContext is rehydrating from localStorage
  if (isLoading) return <Spinner />;

  // Render nothing during the redirect tick to avoid a flash of content
  if (guestOnly && isAuthenticated) return null;
  if (!guestOnly && !isAuthenticated) return null;

  return <>{children}</>;
}