'use client';

import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketDeleteEvent, SocketTodoEvent, Todo } from '@/types';
import { useTenant } from '@/contexts/TenantContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3300/boards';

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

const socketCache = new Map<string, Socket>();

function getSocket(token: string): Socket {
  if (socketCache.has(token)) {
    return socketCache.get(token)!;
  }

  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketCache.set(token, socket);
  return socket;
}

export function useSocket({
  boardId,
  onTodoCreated,
  onTodoUpdated,
  onTodoDeleted,
}: UseSocketOptions): UseSocketReturn {
  const { token, user } = useTenant();
  const tenantSlug = user?.tenant?.slug ?? null;

  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

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

    function handleConnect() {
      isConnectedRef.current = true;
      setTimeout(() => {
        socket.emit('board:join', { boardId, tenantSlug });
      }, 200);
    }

    function handleDisconnect(reason: string) {
      isConnectedRef.current = false;
      console.warn('[Socket] Disconnected:', reason);
    }

    function handleConnectError(err: Error) {
      console.error('[Socket] Connection error:', err.message);
    }

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

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('todo:created', handleTodoCreated);
    socket.on('todo:updated', handleTodoUpdated);
    socket.on('todo:deleted', handleTodoDeleted);

    if (socket.connected) handleConnect();

    return () => {
      socket.emit('board:leave', { boardId, tenantSlug });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('todo:created', handleTodoCreated);
      socket.off('todo:updated', handleTodoUpdated);
      socket.off('todo:deleted', handleTodoDeleted);

      // Remove from cache when socket disconnects so next login gets a fresh one
      socket.on('disconnect', () => {
        socketCache.delete(token);
      });
    };
  }, [token, boardId, tenantSlug, user?.id]);

  const emitTodoCreated = useCallback(
    (todo: Todo) => {
      if (!tenantSlug) return;
      socketRef.current?.emit('todo:created', { todo, boardId, tenantSlug, actorId: user?.id });
    },
    [boardId, tenantSlug, user?.id],
  );

  const emitTodoUpdated = useCallback(
    (todo: Todo) => {
      if (!tenantSlug) return;
      socketRef.current?.emit('todo:updated', { todo, boardId, tenantSlug, actorId: user?.id });
    },
    [boardId, tenantSlug, user?.id],
  );

  const emitTodoDeleted = useCallback(
    (todoId: string) => {
      if (!tenantSlug) return;
      socketRef.current?.emit('todo:deleted', { todoId, boardId, tenantSlug, actorId: user?.id });
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