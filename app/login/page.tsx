'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import { AuthGuard } from '../../guards/AuthGuard';
import { api } from '@/lib/axios';
import { loginSchema, LoginFormValues } from '../../types/schemas';
import { AuthResponse } from '@/types';
import { apiClient } from '@/lib/axios';

// ─── Form ─────────────────────────────────────────────────────────────────────

function LoginForm() {
  const { login } = useTenant();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', tenantSlug: '', },
  });

  const { mutateAsync, error: mutationError } = useMutation<
    AuthResponse,
    { message?: string },
    LoginFormValues
  >({
    mutationFn: (values) => {
      apiClient.defaults.headers.common['X-Tenant-Slug'] = values.tenantSlug;
      const { tenantSlug, ...payload } = values;
      return api.login(payload);
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      router.push('/dashboard');
    },
    onError: (err) => {
      // Surface server-level errors as a root form error
      setError('root.serverError', {
        message: err?.message ?? 'Login failed. Please try again.',
      });
    },
  });

  const onSubmit = handleSubmit((values) => mutateAsync(values).catch(() => { }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-100">TaskFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your workspace</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            {/* Workspace Slug */}
            <div>
              <label htmlFor="tenantSlug" className="block text-sm font-medium text-gray-300 mb-1.5">
                Workspace Slug
              </label>
              <input
                id="tenantSlug"
                type="text"
                autoComplete="organization"
                placeholder="acme-corp"
                aria-invalid={!!errors.tenantSlug}
                className={`input-base ${errors.tenantSlug ? 'border-red-500/60 focus:ring-red-500' : ''}`}
                {...register('tenantSlug')}
              />
              {errors.tenantSlug ? (
                <p className="text-xs text-red-400 mt-1">{errors.tenantSlug.message}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Your organization's unique identifier</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="alice@acme-corp.com"
                aria-invalid={!!errors.email}
                className={`input-base ${errors.email ? 'border-red-500/60 focus:ring-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`input-base ${errors.password ? 'border-red-500/60 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Server / root error */}
            {errors.root?.serverError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3" role="alert">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-400">{errors.root.serverError.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have a workspace?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// guestOnly: redirect already-authenticated users straight to /dashboard

export default function LoginPage() {
  return (
    <AuthGuard guestOnly redirectTo="/dashboard">
      <LoginForm />
    </AuthGuard>
  );
}