'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTodos } from '@/hooks/useTodos';
import { Todo, TodoStatus } from '@/types';
import TodoColumn from '@/components/board/TodoColumn';
import TodoModal from '@/components/board/TodoModal';

const COLUMNS: { status: TodoStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'Todo', color: 'bg-gray-500' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { status: 'done', label: 'Done', color: 'bg-green-500' },
];

export default function BoardPage() {
  const params = useParams();

  const boardId = params.id as string;

  const {
    todos,
    isLoading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    isConnected,
  } = useTodos(boardId);

  const [modal, setModal] = useState<{
    open: boolean;
    todo?: Todo;
    defaultStatus?: TodoStatus;
  }>({ open: false });
  const [actionError, setActionError] = useState('');

  const handleCreate = async (payload: Parameters<typeof createTodo>[0]) => {
    setActionError('');
    try {
      await createTodo(payload);
      setModal({ open: false });
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message ?? 'Failed to create todo');
    }
  };

  const handleUpdate = async (
    todoId: string,
    payload: Parameters<typeof updateTodo>[1],
  ) => {
    setActionError('');
    try {
      await updateTodo(todoId, payload);
      setModal({ open: false });
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message ?? 'Failed to update todo');
    }
  };

  const handleDelete = async (todoId: string) => {
    try {
      await deleteTodo(todoId);
      if (modal.todo?.id === todoId) setModal({ open: false });
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message ?? 'Failed to delete todo');
    }
  };

  const handleStatusChange = async (todo: Todo, status: TodoStatus) => {
    await updateTodo(todo.id, { status });
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <Link href="/dashboard" className="text-indigo-400 text-sm hover:underline">
            ← Back to boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="font-semibold text-gray-100 text-lg leading-none">Board</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {todos.length} task{todos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Live indicator */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${isConnected
            ? 'bg-green-500/10 text-green-400'
            : 'bg-gray-800 text-gray-500'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            {isConnected ? 'Live' : 'Connecting…'}
          </div>
        </div>

        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full p-6 min-w-max">
          {COLUMNS.map(({ status, label, color }) => {
            const columnTodos = todos.filter((t) => t.status === status);
            return (
              <TodoColumn
                key={status}
                status={status}
                label={label}
                color={color}
                todos={columnTodos}
                isLoading={isLoading}
                onAddClick={() => setModal({ open: true, defaultStatus: status })}
                onTodoClick={(todo) => setModal({ open: true, todo })}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <TodoModal
          todo={modal.todo}
          defaultStatus={modal.defaultStatus ?? 'todo'}
          actionError={actionError}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={() => {
            setModal({ open: false });
            setActionError('');
          }}
        />
      )}
    </div>
  );
}