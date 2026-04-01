'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SocketDeleteEvent, SocketTodoEvent, Todo, TodoStatus } from '@/types';
import { api } from '@/lib/axios';
import { useSocket } from './useSocket';

interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  createTodo: (payload: {
    title: string;
    description?: string;
    status: TodoStatus;
    priority: 'low' | 'medium' | 'high';
    assigneeId?: string;
  }) => Promise<void>;
  updateTodo: (
    todoId: string,
    payload: Partial<{
      title: string;
      description: string;
      status: TodoStatus;
      priority: 'low' | 'medium' | 'high';
      assigneeId: string;
    }>,
  ) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  isConnected: boolean;
}

export function useTodos(boardId: string): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch initial todos ───────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getTodos(boardId);
        if (!cancelled) setTodos(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Failed to fetch todos';
          setError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTodos();
    return () => { cancelled = true; };
  }, [boardId]);

  // ── Socket event handlers (update local state from other users) ───────────

  const handleTodoCreated = useCallback((event: SocketTodoEvent) => {
    setTodos((prev) => {
      if (prev.find((t) => t.id === event.todo.id)) return prev;
      return [event.todo, ...prev];
    });
  }, []);

  const handleTodoUpdated = useCallback((event: SocketTodoEvent) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === event.todo.id ? event.todo : t)),
    );
  }, []);

  const handleTodoDeleted = useCallback((event: SocketDeleteEvent) => {
    setTodos((prev) => prev.filter((t) => t.id !== event.todoId));
  }, []);

  const { isConnected, emitTodoCreated, emitTodoUpdated, emitTodoDeleted } =
    useSocket({
      boardId,
      onTodoCreated: handleTodoCreated,
      onTodoUpdated: handleTodoUpdated,
      onTodoDeleted: handleTodoDeleted,
    });

  // ── CRUD with optimistic updates ─────────────────────────────────────────

  const createTodo = useCallback(
    async (payload: {
      title: string;
      description?: string;
      status: TodoStatus;
      priority: 'low' | 'medium' | 'high';
      assigneeId?: string;
    }) => {
      const created: Todo = await api.createTodo(boardId, payload);
      // Optimistic: add locally immediately
      setTodos((prev) => [created, ...prev]);
      // Broadcast to other tabs/users
      emitTodoCreated(created);
    },
    [boardId, emitTodoCreated],
  );

  const updateTodo = useCallback(
    async (
      todoId: string,
      payload: Partial<{
        title: string;
        description: string;
        status: TodoStatus;
        priority: 'low' | 'medium' | 'high';
        assigneeId: string;
      }>,
    ) => {
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, ...payload } : t)),
      );

      try {
        const updated: Todo = await api.updateTodo(boardId, todoId, payload);
        setTodos((prev) =>
          prev.map((t) => (t.id === todoId ? updated : t)),
        );
        emitTodoUpdated(updated);
      } catch (err) {
        // Roll back on failure
        setTodos((prev) =>
          prev.map((t) => (t.id === todoId ? { ...t, ...payload } : t)),
        );
        throw err;
      }
    },
    [boardId, emitTodoUpdated],
  );

  const deleteTodo = useCallback(
    async (todoId: string) => {
      // Optimistic removal
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      try {
        await api.deleteTodo(boardId, todoId);
        emitTodoDeleted(todoId);
      } catch (err) {
        // Roll back by re-fetching
        const data = await api.getTodos(boardId);
        setTodos(data);
        throw err;
      }
    },
    [boardId, emitTodoDeleted],
  );

  return {
    todos,
    isLoading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    isConnected,
  };
}