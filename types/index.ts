// ─── Auth & User ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantName: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
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
  assignee?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  status: TodoStatus;
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
}

export interface UpdateTodoPayload extends Partial<CreateTodoPayload> {
  id: string;
}

// ─── Socket Events ───────────────────────────────────────────────────────────

export interface SocketTodoEvent {
  todo: Todo;
  boardId: string;
  tenantId: string;
  actorId: string | undefined;
}

export interface SocketDeleteEvent {
  todoId: string;
  boardId: string;
  tenantId: string;
  actorId: string | undefined;
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