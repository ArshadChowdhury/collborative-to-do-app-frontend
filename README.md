# TaskFlow — Frontend

A multi-tenant collaborative task management app built with Next.js 14. Multiple users within the same workspace can create boards, manage todos across Kanban columns, and see each other's changes in real time without refreshing.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.2 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Data fetching | TanStack Query | ^5.96 |
| Forms | React Hook Form + Zod | ^7.72 / ^4.3.6 |
| HTTP client | Axios | ^1.14 |
| Real-time | Socket.io client | ^4.8.3 |

---

## Getting Started

### Prerequisites

- Node.js 20+
- The NestJS backend running (see backend README)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3300/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3300/boards
```

```bash
# 3. Start the dev server
pnpm run dev
```

The app runs at **http://localhost:3000**.

### Other scripts

```bash
pnpm run build       # Production build
pnpm run start       # Serve the production build
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout — mounts <Providers>
│   ├── page.tsx                  # Root redirect → /dashboard
│   ├── login/
│   │   └── page.tsx              # Login form (RHF + Zod, guestOnly guard)
│   ├── signup/
│   │   └── page.tsx              # Signup form (RHF + Zod, guestOnly guard)
│   └── dashboard/
│       ├── layout.tsx            # Auth-guarded layout with Sidebar
│       ├── page.tsx              # Board grid
│       └── board/[id]/
│           └── page.tsx          # Kanban board view
│
├── components/
│   ├── board/
│   │   ├── TodoColumn.tsx        # Kanban column with card list
│   │   ├── TodoCard.tsx          # Individual task card
│   │   ├── TodoModal.tsx         # Create / edit / delete modal
│   │   └── CreateBoardModal.tsx  # New board modal with color picker
│   │   └── InviteMemberModal.tsx  # New member invitation modal
│   ├── layout/
│   │   └── Sidebar.tsx           # Board navigation + user profile
│
├── contexts/
│   └── TenantContext.tsx         # Auth state, user, tenantId — persisted to localStorage
│   └── Providers.tsx         # Combined TenantProvider + QueryClientProvider
│
├── hooks/
│   ├── useBoards.ts              # Board CRUD via TanStack Query
│   ├── useTodos.ts               # Todo CRUD + socket integration via TanStack Query
│   └── useSocket.ts              # Socket.io connection, room management, event relay
│
├── lib/
│   ├── axios.ts                  # Axios instance with auth + tenant header interceptors
│   ├── queryClient.ts            # QueryClient config + centralised query key factory
│
└── types/
│    └── index.ts                  # Shared TypeScript interfaces
│    └── schemas.ts                # All Zod schemas (login, signup, board, todo)
├── guards/
│    └── AuthGuard.tsx         # Reusable auth guard (protected + guestOnly)

```

---

## Authentication

Login and signup use **React Hook Form** with **Zod** resolvers for client-side validation before any request is made. Field-level errors appear inline beneath each input. Server errors surface via RHF's `setError('root.serverError', ...)` pattern so they never require a separate error state.

**`AuthGuard`** handles two modes:

```tsx
// Protect a private route — redirects unauthenticated users to /login?returnTo=…
<AuthGuard>
  <Dashboard />
</AuthGuard>

// Bounce already-logged-in users away from auth pages
<AuthGuard guestOnly redirectTo="/dashboard">
  <LoginForm />
</AuthGuard>
```

The guard waits for `TenantContext` to finish rehydrating from `localStorage` before making a redirect decision, so there's no flash of the wrong page on hard refresh.

After login the backend returns:

```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "alice@acme.com",
    "name": "Alice",
    "tenant": {
      "id": "...",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "created_at": "..."
    }
  }
}
```

Both the token and the full user object (including the nested `tenant`) are stored in `localStorage` under `mt_todo_token` and `mt_todo_user`.

---

## HTTP Client & Tenant Headers

Every outgoing Axios request automatically carries three headers set at login time:

```
Authorization:  Bearer <jwt>
x-tenant-id:    <tenant.id>
X-Tenant-Slug:  <tenant.slug>
```

**Two mechanisms** ensure these headers are always present:

1. **`setAuthToken(token, tenantId, tenantSlug)`** — called immediately after login and after page rehydration. Sets Axios instance-level defaults so all requests made thereafter carry the headers without any per-call code.

2. **Request interceptor** — a defensive fallback that reads `localStorage` on every request. Covers edge cases where the Axios instance was created before `login()` ran (e.g., a module imported at the top level before context mounts).

A **response interceptor** handles `401` responses globally — it clears `localStorage` and redirects to `/login` so stale sessions never leave the user stuck.

---

## Data Fetching — TanStack Query

All server state lives in the TanStack Query cache. There is no `useState` for fetched data anywhere in the app.

### Query key factory

Keys are centralised in `src/lib/queryClient.ts`:

```ts
queryKeys.boards.list()           // ['boards', 'list']
queryKeys.boards.detail(id)       // ['boards', 'detail', '<id>']
queryKeys.todos.byBoard(boardId)  // ['todos', 'board', '<boardId>']
```

This means cache invalidations are always precise — deleting a board invalidates `boards.list()` without touching any todo caches.

### QueryClient defaults

| Setting | Value | Reason |
|---|---|---|
| `staleTime` | 30 s | Boards and todos don't change without user action — avoids redundant refetches when navigating |
| `gcTime` | 5 min | Keeps board data available if you switch tabs briefly |
| `retry` | 0 on 4xx, 1 on 5xx | 4xx errors (401, 404, 422) are not transient — retrying wastes time |
| `refetchOnWindowFocus` | false | Real-time socket events keep data current; focus refetch would cause flicker |

### Optimistic updates

Both `useBoards` and `useTodos` use the full optimistic update pattern for mutations:

```
onMutate  → snapshot current cache, apply optimistic change
onError   → roll back to snapshot
onSettled → invalidate to sync with server truth
```

Errors thrown by `mutateAsync` are always normalized to a plain `Error` instance before reaching the UI, so components never accidentally render a raw API error object as a React child.

---

## Real-Time Collaboration — Socket.io

`useSocket` manages a **module-level singleton** socket connection. One connection per browser tab, shared across all hook instances — calling `useSocket` from multiple components does not open multiple connections.

### Flow

```
User creates a todo
      │
      ▼
useTodos.createTodo()
      │
      ├── REST POST /boards/:id/todos  ──▶  server persists + broadcasts
      │
      └── emitTodoCreated(todo)  ──▶  socket relay to peers
                                              │
                                              ▼
                                  Other users' useSocket handlers
                                              │
                                              ▼
                                  qc.setQueryData(key, ...)  ← patches TanStack cache
                                              │
                                              ▼
                                  UI re-renders automatically ✓
```

Socket events update the **TanStack Query cache directly** via `qc.setQueryData`. There is no separate `useState` array for real-time todos — the same cache that `useQuery` reads is patched in place, so React re-renders from a single source of truth.

### Tenant isolation

- The server validates `tenantId` on every `join-room` event against the authenticated JWT — a client cannot join another tenant's board room.
- The client-side guard `if (event.tenantId !== tenantId || event.boardId !== boardId) return` filters events that somehow arrive for the wrong scope.
- Events where `actorId === currentUser.id` are ignored — the originator already applied an optimistic update, so applying the echo would double the change.

### Stale closure prevention

Socket event handlers are stored in `useRef` and read via `.current`. This means the handlers always call the latest closure without needing to be re-registered as listeners on every render — a common source of duplicate events in socket hooks.

---

## Form Validation — Zod Schemas

All schemas live in `src/lib/schemas.ts`. Types are derived with `z.infer<>` so there is no type drift between the schema and the form.

| Schema | Key rules |
|---|---|
| `loginSchema` | Slug regex (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), valid email, non-empty password |
| `signupSchema` | Everything in login + min 8 char password, `confirmPassword` cross-field refinement, org name 2–80 chars |
| `createBoardSchema` | Name 1–60 chars, description optional 0–200 chars, hex color validation |
| `createTodoSchema` | Title 1–120 chars, description 0–1000 chars, enum status + priority |

Forms use `noValidate` on the `<form>` element to suppress browser native validation and let Zod handle all messages consistently.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000/api` | Backend REST API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | `http://localhost:4000` | Socket.io server URL |

Both are public (`NEXT_PUBLIC_`) because they are used in client components. Never put secrets in `NEXT_PUBLIC_` variables.

---

## Key Design Decisions

**No separate real-time state** — socket events patch the TanStack Query cache directly. A single source of truth for all server data regardless of whether it arrived via REST or WebSocket.

**`AuthGuard` component over middleware** — Next.js middleware runs on the edge and cannot read `localStorage`. Using a client component guard keeps auth logic in userland where it can access the full `TenantContext`, show a spinner during rehydration, and preserve the `?returnTo` URL for post-login redirect.

**Module-level socket singleton** — prevents duplicate WebSocket connections when `useSocket` is called from multiple components or when React StrictMode double-invokes effects in development.

**Zod on both sides** — schemas define the validation rules, `z.infer` derives the TypeScript types. Form types, API payload types, and schema rules are always in sync with no manual duplication.

**Normalized mutation errors** — all `mutateAsync` calls are wrapped to rethrow as `new Error(message)`. This prevents the Axios error object `{ message, error, statusCode }` from ever reaching a React render path where it would cause "Objects are not valid as a React child".