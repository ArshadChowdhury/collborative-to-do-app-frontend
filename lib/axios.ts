import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

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
 * Sets the Authorization and x-tenant-id headers on every request.
 * Called once after login and after page rehydration.
 */
export function setAuthToken(token: string, tenantId: string): void {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  apiClient.defaults.headers.common['x-tenant-id'] = tenantId;
}

export function clearAuthToken(): void {
  delete apiClient.defaults.headers.common['Authorization'];
  delete apiClient.defaults.headers.common['x-tenant-id'];
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
          config.headers['x-tenant-id'] = parsed.tenantId;
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

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Clear stale credentials and hard-redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mt_todo_token');
        localStorage.removeItem('mt_todo_user');
        window.location.href = '/login';
      }
    }

    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message ??
        'An unexpected error occurred.',
      statusCode: error.response?.status,
    };

    return Promise.reject(apiError);
  },
);

// ─── API Helpers ──────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (payload: { email: string; password: string; tenantSlug: string }) =>
    apiClient.post('/auth/login', payload).then((r) => r.data),

  signup: (payload: {
    name: string;
    email: string;
    password: string;
    tenantName: string;
    tenantSlug: string;
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
      priority: string;
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
      priority: string;
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