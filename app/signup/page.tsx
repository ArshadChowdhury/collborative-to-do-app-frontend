'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import { AuthGuard } from '../../guards/AuthGuard';
import { api } from '@/lib/axios';
import { signupSchema, SignupFormValues } from '../../types/schemas';
import { AuthResponse } from '@/types';

// ─── Reusable field error component ──────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-400 mt-1">{message}</p>;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function SignupForm() {
  const { login } = useTenant();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      tenantName: '',
      tenantSlug: '',
    },
  });

  // Auto-generate slug from tenant name as the user types
  const handleTenantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('tenantName', value, { shouldValidate: true });
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('tenantSlug', slug, { shouldValidate: !!slug });
  };

  const { mutateAsync } = useMutation<
    AuthResponse,
    { message?: string },
    SignupFormValues
  >({
    mutationFn: (values) => api.signup(values),
    onSuccess: (data) => {
      login(data.token, data.user);
      router.push('/dashboard');
    },
    onError: (err) => {
      setError('root.serverError', {
        message: err?.message ?? 'Signup failed. Please try again.',
      });
    },
  });

  const onSubmit = handleSubmit((values) => mutateAsync(values));

  const inputClass = (hasError: boolean) =>
    `input-base ${hasError ? 'border-red-500/60 focus:ring-red-500' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-100">TaskFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Create your workspace</h1>
          <p className="text-gray-400 text-sm mt-1">Start collaborating with your team</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Alice Smith"
                autoComplete="name"
                aria-invalid={!!errors.name}
                className={inputClass(!!errors.name)}
                {...register('name')}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="alice@company.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className={inputClass(!!errors.email)}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className={inputClass(!!errors.password)}
                {...register('password')}
              />
              <FieldError message={errors.password?.message} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                className={inputClass(!!errors.confirmPassword)}
                {...register('confirmPassword')}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            {/* Org name + slug side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Organization Name
                </label>
                <input
                  id="tenantName"
                  type="text"
                  placeholder="Acme Corp"
                  autoComplete="organization"
                  aria-invalid={!!errors.tenantName}
                  className={inputClass(!!errors.tenantName)}
                  {...register('tenantName', { onChange: handleTenantNameChange })}
                />
                <FieldError message={errors.tenantName?.message} />
              </div>

              <div>
                <label htmlFor="tenantSlug" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Workspace Slug
                </label>
                <input
                  id="tenantSlug"
                  type="text"
                  placeholder="acme-corp"
                  aria-invalid={!!errors.tenantSlug}
                  className={inputClass(!!errors.tenantSlug)}
                  {...register('tenantSlug')}
                />
                <FieldError message={errors.tenantSlug?.message} />
              </div>
            </div>

            {/* Server / root error */}
            {errors.root?.serverError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3" role="alert">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-400">{errors.root.serverError.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating workspace…
                </>
              ) : (
                'Create Workspace'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have a workspace?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  return (
    <AuthGuard guestOnly redirectTo="/dashboard">
      <SignupForm />
    </AuthGuard>
  );
}