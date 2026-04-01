// 'use client';

// import { useCallback } from 'react';
// import {
//   useQuery,
//   useMutation,
//   useQueryClient,
// } from '@tanstack/react-query';
// import { SocketDeleteEvent, SocketTodoEvent, Todo, TodoStatus } from '@/types';
// import { api } from '@/lib/axios';
// import { queryKeys } from '@/lib/queryClient';
// import { useSocket } from './useSocket';

// // ─── Types ────────────────────────────────────────────────────────────────────

// type CreateTodoPayload = {
//   title: string;
//   description?: string;
//   status: TodoStatus;
//   assigneeId?: string;
// };

// type UpdateTodoPayload = Partial<{
//   title: string;
//   description: string;
//   status: TodoStatus;
//   assigneeId: string;
// }>;

// interface UseTodosReturn {
//   todos: Todo[];
//   isLoading: boolean;
//   isFetching: boolean;
//   error: string | null;
//   createTodo: (payload: CreateTodoPayload) => Promise<void>;
//   updateTodo: (todoId: string, payload: UpdateTodoPayload) => Promise<void>;
//   deleteTodo: (todoId: string) => Promise<void>;
//   isConnected: boolean;
// }


// // ─── Hook ─────────────────────────────────────────────────────────────────────

// export function useTodos(boardId: string): UseTodosReturn {
//   const qc = useQueryClient();
//   const key = queryKeys.todos.byBoard(boardId);

//   // ── Fetch ─────────────────────────────────────────────────────────────────

//   const {
//     data: todos = [],
//     isLoading,
//     isFetching,
//     error: queryError,
//   } = useQuery<Todo[], { message?: string }>({
//     queryKey: key,
//     queryFn: () => api.getTodos(boardId),
//     enabled: !!boardId,
//   });

//   // ── Socket event handlers — patch the React Query cache directly ──────────
//   // This is the key integration: instead of managing a separate useState for
//   // real-time updates, socket events update the same cache that useQuery reads,
//   // so the UI re-renders automatically via TanStack Query's subscription.

//   const handleTodoCreated = useCallback(
//     (event: SocketTodoEvent) => {
//       qc.setQueryData<Todo[]>(key, (prev = []) => {
//         if (event.actorId === user?.id) return;
//         onCreatedRef.current(event);
//       });
//     },
//     [qc, key],
//   );

//   const handleTodoUpdated = useCallback(
//     (event: SocketTodoEvent) => {
//       qc.setQueryData<Todo[]>(key, (prev = []) =>
//         prev.map((t) => (t.id === event.todo.id ? event.todo : t)),
//       );
//     },
//     [qc, key],
//   );

//   const handleTodoDeleted = useCallback(
//     (event: SocketDeleteEvent) => {
//       qc.setQueryData<Todo[]>(key, (prev = []) =>
//         prev.filter((t) => t.id !== event.todoId),
//       );
//     },
//     [qc, key],
//   );

//   const { isConnected, emitTodoCreated, emitTodoUpdated, emitTodoDeleted } =
//     useSocket({ boardId, onTodoCreated: handleTodoCreated, onTodoUpdated: handleTodoUpdated, onTodoDeleted: handleTodoDeleted });

//   // ── Create ────────────────────────────────────────────────────────────────

//   const createMutation = useMutation<Todo, { message?: string }, CreateTodoPayload>({
//     mutationFn: (payload) => api.createTodo(boardId, payload),
//     onSuccess: (created) => {
//       emitTodoCreated(created);
//     },
//     onSettled: () => {
//       qc.invalidateQueries({ queryKey: key });  // ← refetch is the source of truth
//     },
//     onError: () => {
//       qc.invalidateQueries({ queryKey: key });
//     },
//   });

//   // ── Update (with optimistic update) ──────────────────────────────────────

//   const updateMutation = useMutation<
//     Todo,
//     { message?: string },
//     { todoId: string; payload: UpdateTodoPayload }
//   >({
//     mutationFn: ({ todoId, payload }) => api.updateTodo(boardId, todoId, payload),
//     onMutate: async ({ todoId, payload }) => {
//       await qc.cancelQueries({ queryKey: key });
//       const previous = qc.getQueryData<Todo[]>(key);
//       qc.setQueryData<Todo[]>(key, (prev = []) =>
//         prev.map((t) => (t.id === todoId ? { ...t, ...payload } : t)),
//       );
//       return { previous };
//     },
//     onSuccess: (updated) => {
//       emitTodoUpdated(updated);
//     },
//     onError: (_err, _vars, context) => {
//       const ctx = context as { previous?: Todo[] } | undefined;
//       if (ctx?.previous) qc.setQueryData(key, ctx.previous);
//     },
//     onSettled: () => {
//       qc.invalidateQueries({ queryKey: key });
//     },
//   });

//   // ── Delete (with optimistic removal) ─────────────────────────────────────

//   const deleteMutation = useMutation<void, { message?: string }, string>({
//     mutationFn: (todoId) => api.deleteTodo(boardId, todoId),
//     onMutate: async (todoId) => {
//       await qc.cancelQueries({ queryKey: key });
//       const previous = qc.getQueryData<Todo[]>(key);
//       qc.setQueryData<Todo[]>(key, (prev = []) =>
//         prev.filter((t) => t.id !== todoId),
//       );
//       return { previous };
//     },
//     onSuccess: (_data, todoId) => {
//       emitTodoDeleted(todoId);
//     },
//     onError: (_err, _todoId, context) => {
//       const ctx = context as { previous?: Todo[] } | undefined;
//       if (ctx?.previous) qc.setQueryData(key, ctx.previous);
//     },
//     onSettled: () => {
//       qc.invalidateQueries({ queryKey: key });
//     },
//   });

//   return {
//     todos,
//     isLoading,
//     isFetching,
//     error: (queryError as { message?: string })?.message ?? null,
//     createTodo: (payload) => createMutation.mutateAsync(payload).then(() => undefined),
//     updateTodo: (todoId, payload) => updateMutation.mutateAsync({ todoId, payload }).then(() => undefined),
//     deleteTodo: (todoId) => deleteMutation.mutateAsync(todoId),
//     isConnected,
//   };
// }

'use client';

import { useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { SocketDeleteEvent, SocketTodoEvent, Todo, TodoStatus } from '@/types';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/queryClient';
import { useSocket } from './useSocket';

type CreateTodoPayload = {
  title: string;
  description?: string;
  status: TodoStatus;
  assigneeId?: string;
};

type UpdateTodoPayload = Partial<{
  title: string;
  description: string;
  status: TodoStatus;
  assigneeId: string;
}>;

interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  createTodo: (payload: CreateTodoPayload) => Promise<void>;
  updateTodo: (todoId: string, payload: UpdateTodoPayload) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  isConnected: boolean;
}

const dedup = (todos: Todo[]) =>
  todos.filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

export function useTodos(boardId: string): UseTodosReturn {
  const qc = useQueryClient();
  const key = queryKeys.todos.byBoard(boardId);

  const {
    data: todos = [],
    isLoading,
    isFetching,
    error: queryError,
  } = useQuery<Todo[], { message?: string }>({
    queryKey: key,
    queryFn: () => api.getTodos(boardId),
    enabled: !!boardId,
  });

  // ── Socket handlers — update React Query cache directly ───────────────────

  const handleTodoCreated = useCallback(
    (event: SocketTodoEvent) => {
      qc.setQueryData<Todo[]>(key, (prev = []) => {
        if (prev.find((t) => t.id === event.todo.id)) return prev;
        return dedup([event.todo, ...prev]);
      });
    },
    [qc, key],
  );

  const handleTodoUpdated = useCallback(
    (event: SocketTodoEvent) => {
      qc.setQueryData<Todo[]>(key, (prev = []) =>
        prev.map((t) => (t.id === event.todo.id ? event.todo : t)),
      );
    },
    [qc, key],
  );

  const handleTodoDeleted = useCallback(
    (event: SocketDeleteEvent) => {
      qc.setQueryData<Todo[]>(key, (prev = []) =>
        prev.filter((t) => t.id !== event.todoId),
      );
    },
    [qc, key],
  );

  const { isConnected, emitTodoCreated, emitTodoUpdated, emitTodoDeleted } =
    useSocket({
      boardId,
      onTodoCreated: handleTodoCreated,
      onTodoUpdated: handleTodoUpdated,
      onTodoDeleted: handleTodoDeleted,
    });

  // ── Create ────────────────────────────────────────────────────────────────

  const createMutation = useMutation<Todo, { message?: string }, CreateTodoPayload>({
    mutationFn: (payload) => api.createTodo(boardId, payload),
    onSuccess: (created) => {
      // Add to own cache immediately, then emit to others
      qc.setQueryData<Todo[]>(key, (prev = []) => dedup([created, ...prev]));
      emitTodoCreated(created);
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  // ── Update ────────────────────────────────────────────────────────────────

  const updateMutation = useMutation<
    Todo,
    { message?: string },
    { todoId: string; payload: UpdateTodoPayload }
  >({
    mutationFn: ({ todoId, payload }) => api.updateTodo(boardId, todoId, payload),
    onMutate: async ({ todoId, payload }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Todo[]>(key);
      qc.setQueryData<Todo[]>(key, (prev = []) =>
        prev.map((t) => (t.id === todoId ? { ...t, ...payload } : t)),
      );
      return { previous };
    },
    onSuccess: (updated) => {
      emitTodoUpdated(updated);
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previous?: Todo[] } | undefined;
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation<void, { message?: string }, string>({
    mutationFn: (todoId) => api.deleteTodo(boardId, todoId),
    onMutate: async (todoId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Todo[]>(key);
      qc.setQueryData<Todo[]>(key, (prev = []) =>
        prev.filter((t) => t.id !== todoId),
      );
      return { previous };
    },
    onSuccess: (_data, todoId) => {
      emitTodoDeleted(todoId);
    },
    onError: (_err, _todoId, context) => {
      const ctx = context as { previous?: Todo[] } | undefined;
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  return {
    todos,
    isLoading,
    isFetching,
    error: (queryError as { message?: string })?.message ?? null,
    createTodo: (payload) => createMutation.mutateAsync(payload).then(() => undefined),
    updateTodo: (todoId, payload) =>
      updateMutation.mutateAsync({ todoId, payload }).then(() => undefined),
    deleteTodo: (todoId) => deleteMutation.mutateAsync(todoId),
    isConnected,
  };
}