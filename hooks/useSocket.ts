// 'use client';

// import { useCallback, useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { SocketDeleteEvent, SocketTodoEvent, Todo } from '@/types';
// import { useTenant } from '@/contexts/TenantContext';

// const SOCKET_URL =
//   process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface UseSocketOptions {
//   boardId: string;
//   onTodoCreated: (event: SocketTodoEvent) => void;
//   onTodoUpdated: (event: SocketTodoEvent) => void;
//   onTodoDeleted: (event: SocketDeleteEvent) => void;
// }

// interface UseSocketReturn {
//   isConnected: boolean;
//   emitTodoCreated: (todo: Todo) => void;
//   emitTodoUpdated: (todo: Todo) => void;
//   emitTodoDeleted: (todoId: string) => void;
// }

// // ─── Module-level socket singleton ───────────────────────────────────────────
// // One socket per browser tab, shared across hook instances.

// let sharedSocket: Socket | null = null;

// function getSocket(token: string): Socket {
//   if (!sharedSocket || !sharedSocket.connected) {
//     sharedSocket = io(SOCKET_URL, { // connects to default "/" namespace
//       auth: { token },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });
//   }
//   return sharedSocket;
// }

// // ─── Hook ─────────────────────────────────────────────────────────────────────

// export function useSocket({
//   boardId,
//   onTodoCreated,
//   onTodoUpdated,
//   onTodoDeleted,
// }: UseSocketOptions): UseSocketReturn {
//   const { token, tenantId, user } = useTenant();
//   const socketRef = useRef<Socket | null>(null);
//   const isConnectedRef = useRef(false);

//   // Stable callback refs — prevent stale closures in socket handlers
//   const onCreatedRef = useRef(onTodoCreated);
//   const onUpdatedRef = useRef(onTodoUpdated);
//   const onDeletedRef = useRef(onTodoDeleted);
//   onCreatedRef.current = onTodoCreated;
//   onUpdatedRef.current = onTodoUpdated;
//   onDeletedRef.current = onTodoDeleted;

//   useEffect(() => {
//     if (!token || !boardId || !tenantId) return;

//     const socket = getSocket(token);
//     socketRef.current = socket;

//     // ── Connection lifecycle ──────────────────────────────────────────────────

//     function handleConnect() {
//       isConnectedRef.current = true;
//       socket.emit('board:join', { boardId, tenantSlug }); // ← was 'join-room' with tenantId
//       console.log(`[Socket] Joined board:${boardId} tenant:${tenantSlug}`);
//     }

//     function handleDisconnect(reason: string) {
//       isConnectedRef.current = false;
//       console.warn('[Socket] Disconnected:', reason);
//     }

//     function handleConnectError(err: Error) {
//       console.error('[Socket] Connection error:', err.message);
//     }

//     // ── Domain event handlers ─────────────────────────────────────────────────

//     function handleTodoCreated(event: SocketTodoEvent) {
//       // Guard: only process events for this tenant and board
//       if (event.tenantId !== tenantId || event.boardId !== boardId) return;
//       // Skip events originating from this user (optimistic update already applied)
//       if (event.actorId === user?.id) return;
//       onCreatedRef.current(event);
//     }

//     function handleTodoUpdated(event: SocketTodoEvent) {
//       if (event.tenantId !== tenantId || event.boardId !== boardId) return;
//       if (event.actorId === user?.id) return;
//       onUpdatedRef.current(event);
//     }

//     function handleTodoDeleted(event: SocketDeleteEvent) {
//       if (event.tenantId !== tenantId || event.boardId !== boardId) return;
//       if (event.actorId === user?.id) return;
//       onDeletedRef.current(event);
//     }

//     // Register listeners
//     socket.on('connect', handleConnect);
//     socket.on('disconnect', handleDisconnect);
//     socket.on('connect_error', handleConnectError);
//     socket.on('todo-created', handleTodoCreated);
//     socket.on('todo-updated', handleTodoUpdated);
//     socket.on('todo-deleted', handleTodoDeleted);

//     // If already connected, join immediately
//     if (socket.connected) {
//       handleConnect();
//     }

//     return () => {
//       socket.emit('board:leave', { boardId, tenantSlug }); ;
//       socket.off('connect', handleConnect);
//       socket.off('disconnect', handleDisconnect);
//       socket.off('connect_error', handleConnectError);
//       socket.off('todo-created', handleTodoCreated);
//       socket.off('todo-updated', handleTodoUpdated);
//       socket.off('todo-deleted', handleTodoDeleted);
//     };
//   }, [token, boardId, tenantId, user?.id]);

//   // ── Emit helpers (called after optimistic local state update) ───────────────
//   // tenantId is string | null and user?.id is string | undefined coming from
//   // the context. We narrow to string once here; if either is missing the
//   // socket is not yet ready anyway, so we bail out early.

//   const emitTodoCreated = useCallback(
//     (todo: Todo) => {
//       if (!tenantId) return;
//       const payload: SocketTodoEvent = {
//         todo,
//         boardId,
//         tenantId,          // narrowed: string (null excluded by guard above)
//         actorId: user?.id, // string | undefined — matches updated interface
//       };
//       socketRef.current?.emit('todo-created', payload);
//     },
//     [boardId, tenantId, user?.id],
//   );

//   const emitTodoUpdated = useCallback(
//     (todo: Todo) => {
//       if (!tenantId) return;
//       const payload: SocketTodoEvent = {
//         todo,
//         boardId,
//         tenantId,
//         actorId: user?.id,
//       };
//       socketRef.current?.emit('todo-updated', payload);
//     },
//     [boardId, tenantId, user?.id],
//   );

//   const emitTodoDeleted = useCallback(
//     (todoId: string) => {
//       if (!tenantId) return;
//       const payload: SocketDeleteEvent = {
//         todoId,
//         boardId,
//         tenantId,
//         actorId: user?.id,
//       };
//       socketRef.current?.emit('todo-deleted', payload);
//     },
//     [boardId, tenantId, user?.id],
//   );

//   return {
//     isConnected: isConnectedRef.current,
//     emitTodoCreated,
//     emitTodoUpdated,
//     emitTodoDeleted,
//   };
// }

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketDeleteEvent, SocketTodoEvent, Todo } from '@/types';
import { useTenant } from '@/contexts/TenantContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseSocketOptions {
  boardId: string;
  onTodoCreated: (event: SocketTodoEvent) => void;
  onTodoUpdated: (event: SocketTodoEvent) => void;
  onTodoDeleted: (event: SocketDeleteEvent) => void;
}

interface UseSocketReturn {
  isConnected: boolean;
  emitTodoCreated: (todo: Todo) => void;
  emitTodoUpdated: (todo: Todo) => void;
  emitTodoDeleted: (todoId: string) => void;
}

// ─── Module-level socket singleton ───────────────────────────────────────────

let sharedSocket: Socket | null = null;

function getSocket(token: string): Socket {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return sharedSocket;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocket({
  boardId,
  onTodoCreated,
  onTodoUpdated,
  onTodoDeleted,
}: UseSocketOptions): UseSocketReturn {
  const { token, user } = useTenant();
  const tenantSlug = user?.tenant?.slug ?? null; // ← use slug, not tenantId

  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  // Stable callback refs — prevent stale closures in socket handlers
  const onCreatedRef = useRef(onTodoCreated);
  const onUpdatedRef = useRef(onTodoUpdated);
  const onDeletedRef = useRef(onTodoDeleted);
  onCreatedRef.current = onTodoCreated;
  onUpdatedRef.current = onTodoUpdated;
  onDeletedRef.current = onTodoDeleted;

  useEffect(() => {
    if (!token || !boardId || !tenantSlug) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    // ── Connection lifecycle ──────────────────────────────────────────────────

    function handleConnect() {
      isConnectedRef.current = true;
      socket.emit('board:join', { boardId, tenantSlug });
      console.log(`[Socket] Joined board:${boardId} tenant:${tenantSlug}`);
    }

    function handleDisconnect(reason: string) {
      isConnectedRef.current = false;
      console.warn('[Socket] Disconnected:', reason);
    }

    function handleConnectError(err: Error) {
      console.error('[Socket] Connection error:', err.message);
    }

    // ── Domain event handlers ─────────────────────────────────────────────────
    // Gateway broadcasts using 'todo:created' / 'todo:updated' / 'todo:deleted'
    // and scopes to room `{tenantSlug}:{boardId}` — so no need for client-side
    // tenant/board guards. We only skip events from this user (optimistic update
    // already applied locally).

    function handleTodoCreated(event: SocketTodoEvent) {
      if (event.actorId === user?.id) return;
      onCreatedRef.current(event);
    }

    function handleTodoUpdated(event: SocketTodoEvent) {
      if (event.actorId === user?.id) return;
      onUpdatedRef.current(event);
    }

    function handleTodoDeleted(event: SocketDeleteEvent) {
      if (event.actorId === user?.id) return;
      onDeletedRef.current(event);
    }

    // Register listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('todo:created', handleTodoCreated);
    socket.on('todo:updated', handleTodoUpdated);
    socket.on('todo:deleted', handleTodoDeleted);

    // If already connected when effect runs, join immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.emit('board:leave', { boardId, tenantSlug });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('todo:created', handleTodoCreated);
      socket.off('todo:updated', handleTodoUpdated);
      socket.off('todo:deleted', handleTodoDeleted);
    };
  }, [token, boardId, tenantSlug, user?.id]);

  // ── Emit helpers ─────────────────────────────────────────────────────────────

  const emitTodoCreated = useCallback(
    (todo: Todo) => {
      if (!tenantSlug) return;
      const payload: SocketTodoEvent = {
        todo,
        boardId,
        tenantSlug,
        actorId: user?.id,
      };
      socketRef.current?.emit('todo:created', payload);
    },
    [boardId, tenantSlug, user?.id],
  );

  const emitTodoUpdated = useCallback(
    (todo: Todo) => {
      if (!tenantSlug) return;
      const payload: SocketTodoEvent = {
        todo,
        boardId,
        tenantSlug,
        actorId: user?.id,
      };
      socketRef.current?.emit('todo:updated', payload);
    },
    [boardId, tenantSlug, user?.id],
  );

  const emitTodoDeleted = useCallback(
    (todoId: string) => {
      if (!tenantSlug) return;
      const payload: SocketDeleteEvent = {
        todoId,
        boardId,
        tenantSlug,

        actorId: user?.id,
      };
      socketRef.current?.emit('todo:deleted', payload);
    },
    [boardId, tenantSlug, user?.id],
  );

  return {
    isConnected: isConnectedRef.current,
    emitTodoCreated,
    emitTodoUpdated,
    emitTodoDeleted,
  };
}