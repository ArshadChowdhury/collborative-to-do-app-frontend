// ─── Auth & User ────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  tenant: {
    id: string;
    slug: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  tenantName: string;
  tenantSlug: string;
}

// ─── Board ───────────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  todoCount?: number;
}

// ─── Todo ────────────────────────────────────────────────────────────────────

export type TodoStatus = 'todo' | 'in-progress' | 'done';

export interface Todo {
  id: string;
  boardId: string;
  tenantId: string;
  title: string;
  description?: string;
  status: TodoStatus;
  assigneeId?: string;
  assignee?: Pick<User, 'displayName' | 'id'>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  status: TodoStatus;
  assigneeId?: string;
}

export interface UpdateTodoPayload extends Partial<CreateTodoPayload> {
  id: string;
}

// ─── Socket Events ───────────────────────────────────────────────────────────

export interface SocketTodoEvent {
  todo: Todo;
  boardId: string;
  actorId?: string | undefined;
  tenantSlug: String;
}

export interface SocketDeleteEvent {
  todoId: string;
  boardId: string;
  actorId?: string | undefined;
  tenantSlug: String;

}

// ─── API Generic ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}