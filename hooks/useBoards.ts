'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Board } from '@/types';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/queryClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateBoardPayload {
  name: string;
  description?: string;
  color: string;
}

interface UseBoardsReturn {
  boards: Board[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  createBoard: (payload: CreateBoardPayload) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBoards(): UseBoardsReturn {
  const qc = useQueryClient();

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const {
    data: boards = [],
    isLoading,
    isFetching,
    error: queryError,
  } = useQuery<Board[], { message?: string }>({
    queryKey: queryKeys.boards.list(),
    queryFn: () => api.getBoards(),
  });

  // ── Create ────────────────────────────────────────────────────────────────

  const createMutation = useMutation<Board, { message?: string }, CreateBoardPayload>({
    mutationFn: (payload) => api.createBoard(payload),
    onSuccess: (newBoard) => {
      // Optimistically prepend — avoids a full refetch round-trip
      qc.setQueryData<Board[]>(queryKeys.boards.list(), (prev = []) => [
        newBoard,
        ...prev,
      ]);
    },
    onError: () => {
      // On failure, refetch to restore ground truth
      qc.invalidateQueries({ queryKey: queryKeys.boards.list() });
    },
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation<void, { message?: string }, string>({
    mutationFn: (id) => api.deleteBoard(id),
    onMutate: async (id) => {
      // Cancel any in-flight refetch so it doesn't overwrite the optimistic removal
      await qc.cancelQueries({ queryKey: queryKeys.boards.list() });
      const previous = qc.getQueryData<Board[]>(queryKeys.boards.list());
      qc.setQueryData<Board[]>(queryKeys.boards.list(), (prev = []) =>
        prev.filter((b) => b.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      // Roll back to the snapshot taken in onMutate
      const ctx = context as { previous?: Board[] } | undefined;
      if (ctx?.previous) {
        qc.setQueryData(queryKeys.boards.list(), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.boards.list() });
    },
  });

  return {
    boards,
    isLoading,
    isFetching,
    error: (queryError as { message?: string })?.message ?? null,
    createBoard: (payload) => createMutation.mutateAsync(payload),
    deleteBoard: (id) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}