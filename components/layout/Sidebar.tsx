'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';
import { useBoards } from '@/hooks/useBoards';

export default function Sidebar() {
  const { user, logout } = useTenant();
  const { boards, isLoading } = useBoards();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-gray-900/80 border-r border-white/[0.06] h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-100 truncate">TaskFlow</p>
            <p className="text-xs text-gray-500 truncate">{user?.tenantName}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/dashboard'
              ? 'bg-indigo-600/20 text-indigo-300'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          All Boards
        </Link>

        {/* Boards list */}
        <div className="pt-2">
          <p className="px-3 text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
            My Boards
          </p>

          {isLoading ? (
            <div className="space-y-1 px-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 rounded-md bg-gray-800/50 animate-pulse" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-600 italic">No boards yet</p>
          ) : (
            boards.map((board) => {
              const isActive = pathname === `/dashboard/board/${board.id}`;
              return (
                <Link
                  key={board.id}
                  href={`/dashboard/board/${board.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: board.color }}
                  />
                  <span className="truncate">{board.name}</span>
                </Link>
              );
            })
          )}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-indigo-300">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{user?.name}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-gray-600 hover:text-gray-400 transition-colors"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}