'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useTenant } from '@/contexts/TenantContext';

interface InviteMemberModalProps {
    onClose: () => void;
}

interface AddMemberPayload {
    email: string;
    role: 'owner' | 'admin' | 'member';
}

export function InviteMemberModal({ onClose }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'owner' | 'admin' | 'member'>('member');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { user } = useTenant();


    const { mutate, isPending } = useMutation({
        mutationFn: (payload: AddMemberPayload) =>
            apiClient.post('/tenants/current/members', payload).then((r) => r.data),
        onSuccess: () => {
            setSuccess(true);
            setError(null);
        },
        onError: (err: any) => {
            setError(err?.message ?? 'Failed to add member.');
        },
    });

    const handleSubmit = () => {
        if (!email.trim()) {
            setError('Email is required.');
            return;
        }
        mutate({ email: email.trim(), role });
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Panel */}
            <div
                className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-100">Add Member</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {success ? (
                    // Success state
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-gray-200 font-medium">Member added!</p>
                        <p className="text-gray-500 text-sm text-center">They now have access to this workspace.</p>
                        <p className="text-gray-500 text-sm text-center">Share this Workspace Slug - <span className='text-green-600'>{user?.tenant.slug}</span></p>

                        <button
                            onClick={onClose}
                            className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Email ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Paste the user's Email"
                                className="input-base w-full"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                                Ask the user to share their email from their profile.
                            </p>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as typeof role)}
                                className="input-base w-full"
                            >
                                <option value="member">Member — can view and edit boards</option>
                                <option value="admin">Admin — can manage members</option>
                                <option value="owner">Owner — full control</option>
                            </select>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/5 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Adding…
                                    </>
                                ) : (
                                    'Add Member'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}