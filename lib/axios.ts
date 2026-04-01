

import axios, { InternalAxiosRequestConfig } from 'axios';

// ─── Base Instance ────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Token Management ─────────────────────────────────────────────────────────

/**
 * Sets Authorization, x-tenant-id, and X-Tenant-Slug headers on every request.
 * Called once after login and after page rehydration.
 */
export function setAuthToken(token: string, tenantId: string, tenantSlug: string): void {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  apiClient.defaults.headers.common['x-tenant-id'] = tenantId;
  apiClient.defaults.headers.common['X-Tenant-Slug'] = tenantSlug;
}

export function clearAuthToken(): void {
  delete apiClient.defaults.headers.common['Authorization'];
  delete apiClient.defaults.headers.common['x-tenant-id'];
  delete apiClient.defaults.headers.common['X-Tenant-Slug'];
}

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Ensures every outgoing request carries the latest token from localStorage
// (defensive guard in case the instance was created before login).

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mt_todo_token');
      const user = localStorage.getItem('mt_todo_user');

      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      if (user && !config.headers['x-tenant-id']) {
        try {
          const parsed = JSON.parse(user);
          config.headers['x-tenant-id'] = parsed.tenant?.id;
          config.headers['X-Tenant-Slug'] = parsed.tenant?.slug;
        } catch {
          // ignore
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Normalizes error shape and handles 401 globally.

// 

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;

    // Extract a clean string message regardless of shape
    const extract = (msg: unknown): string => {
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg[0]; // NestJS validation arrays
      if (msg && typeof msg === 'object') {
        const obj = msg as Record<string, unknown>;
        if (obj.message) return extract(obj.message);
      }
      return 'Something went wrong. Please try again.';
    };

    const message = extract(data);
    return Promise.reject(new Error(message));
  }
);

// ─── API Helpers ──────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (payload: { email: string; password: string }) =>
    apiClient.post('/auth/login', payload).then((r) => r.data),

  signup: (payload: {
    email: string;
    password: string;
    displayName: string;
  }) => apiClient.post('/auth/signup', payload).then((r) => r.data),

  // Boards
  getBoards: () => apiClient.get('/boards').then((r) => r.data),
  getBoard: (id: string) => apiClient.get(`/boards/${id}`).then((r) => r.data),
  createBoard: (payload: { name: string; description?: string; color: string }) =>
    apiClient.post('/boards', payload).then((r) => r.data),
  deleteBoard: (id: string) =>
    apiClient.delete(`/boards/${id}`).then((r) => r.data),

  // Todos
  getTodos: (boardId: string) =>
    apiClient.get(`/boards/${boardId}/todos`).then((r) => r.data),
  createTodo: (
    boardId: string,
    payload: {
      title: string;
      description?: string;
      status: string;
      assigneeId?: string;
    },
  ) => apiClient.post(`/boards/${boardId}/todos`, payload).then((r) => r.data),
  updateTodo: (
    boardId: string,
    todoId: string,
    payload: Partial<{
      title: string;
      description: string;
      status: string;
      assigneeId: string;
    }>,
  ) =>
    apiClient
      .patch(`/boards/${boardId}/todos/${todoId}`, payload)
      .then((r) => r.data),
  deleteTodo: (boardId: string, todoId: string) =>
    apiClient
      .delete(`/boards/${boardId}/todos/${todoId}`)
      .then((r) => r.data),
};