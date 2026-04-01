import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 30 s — avoids unnecessary refetches when switching
      // between boards or navigating back to the dashboard.
      staleTime: 30_000,
      // Keep inactive query data for 5 minutes before GC.
      gcTime: 5 * 60_000,
      // Retry failed requests once (network blip), but not on 4xx errors.
      retry: (failureCount, error) => {
        const status = (error as { statusCode?: number })?.statusCode;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Don't retry mutations — they are not always idempotent.
      retry: false,
    },
  },
});

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralised key factory prevents typos and makes invalidation predictable.

export const queryKeys = {
  boards: {
    all: ['boards'] as const,
    list: () => [...queryKeys.boards.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.boards.all, 'detail', id] as const,
  },
  todos: {
    all: ['todos'] as const,
    byBoard: (boardId: string) =>
      [...queryKeys.todos.all, 'board', boardId] as const,
  },
} as const;