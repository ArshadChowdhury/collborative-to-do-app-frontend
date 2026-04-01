// // ─── Auth & User ────────────────────────────────────────────────────────────

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   tenantId: string;
//   tenantName: string;
//   avatarUrl?: string;
// }

// export interface AuthResponse {
//   accessToken: string;
//   user: User;
// }

// export interface LoginPayload {
//   email: string;
//   password: string;
//   tenantSlug: string;
// }

// export interface SignupPayload {
//   name: string;
//   email: string;
//   password: string;
//   tenantName: string;
//   tenantSlug: string;
// }

// // ─── Board ───────────────────────────────────────────────────────────────────

// export interface Board {
//   id: string;
//   tenantId: string;
//   name: string;
//   description?: string;
//   color: string;
//   createdAt: string;
//   updatedAt: string;
//   todoCount?: number;
// }

// // ─── Todo ────────────────────────────────────────────────────────────────────

// export type TodoStatus = 'todo' | 'in-progress' | 'done';

// export interface Todo {
//   id: string;
//   boardId: string;
//   tenantId: string;
//   title: string;
//   description?: string;
//   status: TodoStatus;
//   assigneeId?: string;
//   assignee?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
//   priority: 'low' | 'medium' | 'high';
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateTodoPayload {
//   title: string;
//   description?: string;
//   status: TodoStatus;
//   priority: 'low' | 'medium' | 'high';
//   assigneeId?: string;
// }

// export interface UpdateTodoPayload extends Partial<CreateTodoPayload> {
//   id: string;
// }

// // ─── Socket Events ───────────────────────────────────────────────────────────

// export interface SocketTodoEvent {
//   todo: Todo;
//   boardId: string;
//   tenantId: string;
//   actorId: string | undefined;
// }

// export interface SocketDeleteEvent {
//   todoId: string;
//   boardId: string;
//   tenantId: string;
//   actorId: string | undefined;
// }

// // ─── API Generic ─────────────────────────────────────────────────────────────

// export interface ApiError {
//   message: string;
//   code?: string;
//   statusCode?: number;
// }

// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
// }

// ─── Auth & User ────────────────────────────────────────────────────────────

// export interface Tenant {
//   id: string;
//   name: string;
//   slug: string;
//   created_at: string;
// }

// export interface UserTenant {
//   user_id: string;
//   tenant_id: string;
//   role: 'admin' | 'member' | string; // Using string to allow flexibility, or enum if preferred
//   joined_at: string;
//   tenant: Tenant;
// }

// export interface User {
//   id: string;
//   email: string;
//   display_name: string;
//   created_at: string;
//   userTenants: UserTenant[];
//   avatarUrl?: string; // Kept as optional from your previous version
// }

// export interface AuthResponse {
//   accessToken: string;
//   user: User;
// }

// export interface LoginPayload {
//   email: string;
//   password: string;
//   tenantSlug: string;
// }

// export interface SignupPayload {
//   name: string;
//   email: string;
//   password: string;
//   tenantName: string;
//   tenantSlug: string;
// }

// // ─── Board ───────────────────────────────────────────────────────────────────

// export interface Board {
//   id: string;
//   tenantId: string;
//   name: string;
//   description?: string;
//   color: string;
//   createdAt: string;
//   updatedAt: string;
//   todoCount?: number;
// }

// // ─── Todo ────────────────────────────────────────────────────────────────────

// export type TodoStatus = 'todo' | 'in-progress' | 'done';

// export interface Todo {
//   id: string;
//   boardId: string;
//   tenantId: string;
//   title: string;
//   description?: string;
//   status: TodoStatus;
//   assigneeId?: string;
//   assignee?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
//   priority: 'low' | 'medium' | 'high';
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateTodoPayload {
//   title: string;
//   description?: string;
//   status: TodoStatus;
//   priority: 'low' | 'medium' | 'high';
//   assigneeId?: string;
// }

// export interface UpdateTodoPayload extends Partial<CreateTodoPayload> {
//   id: string;
// }

// // ─── Socket Events ───────────────────────────────────────────────────────────

// export interface SocketTodoEvent {
//   todo: Todo;
//   boardId: string;
//   tenantId: string;
//   actorId: string | undefined;
// }

// export interface SocketDeleteEvent {
//   todoId: string;
//   boardId: string;
//   tenantId: string;
//   actorId: string | undefined;
// }

// // ─── API Generic ─────────────────────────────────────────────────────────────

// export interface ApiError {
//   message: string;
//   code?: string;
//   statusCode?: number;
// }

// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
// }

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