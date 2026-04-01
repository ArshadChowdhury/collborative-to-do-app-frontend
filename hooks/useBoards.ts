'use client';

import { useCallback, useEffect, useState } from 'react';
import { Board } from '@/types';
import { api } from '@/lib/axios';

interface UseBoardsReturn {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
  createBoard: (payload: {
    name: string;
    description?: string;
    color: string;
  }) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useBoards(): UseBoardsReturn {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getBoards();
      setBoards(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Failed to fetch boards';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const createBoard = useCallback(
    async (payload: { name: string; description?: string; color: string }) => {
      const newBoard: Board = await api.createBoard(payload);
      setBoards((prev) => [newBoard, ...prev]);
      return newBoard;
    },
    [],
  );

  const deleteBoard = useCallback(async (id: string) => {
    await api.deleteBoard(id);
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    boards,
    isLoading,
    error,
    createBoard,
    deleteBoard,
    refetch: fetchBoards,
  };
}