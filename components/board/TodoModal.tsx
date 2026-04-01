'use client';

import { useEffect, useRef, useState } from 'react';
import { Todo, TodoStatus } from '@/types';

interface TodoModalProps {
  todo?: Todo;
  defaultStatus: TodoStatus;
  actionError: string;
  onCreate: (payload: {
    title: string;
    description?: string;
    status: TodoStatus;
    priority: 'low' | 'medium' | 'high';
    assigneeId?: string;
  }) => Promise<void>;
  onUpdate: (
    todoId: string,
    payload: Partial<{
      title: string;
      description: string;
      status: TodoStatus;
      priority: 'low' | 'medium' | 'high';
    }>,
  ) => Promise<void>;
  onDelete: (todoId: string) => Promise<void>;
  onClose: () => void;
}

export default function TodoModal({
  todo,
  defaultStatus,
  actionError,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: TodoModalProps) {
  const isEditing = !!todo;
  const [form, setForm] = useState({
    title: todo?.title ?? '',
    description: todo?.description ?? '',
    status: todo?.status ?? defaultStatus,
    priority: todo?.priority ?? ('medium' as 'low' | 'medium' | 'high'),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSaving(true);
    try {
      if (isEditing) {
        await onUpdate(todo.id, form);
      } else {
        await onCreate(form);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!todo) return;
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md card p-6 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-100 text-lg">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Title *
            </label>
            <input
              ref={titleRef}
              type="text"
              className="input-base"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="input-base resize-none"
              rows={3}
              placeholder="Add more details…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                className="input-base cursor-pointer"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as TodoStatus }))
                }
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                className="input-base cursor-pointer"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as 'low' | 'medium' | 'high',
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {actionError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
              <p className="text-sm text-red-400">{actionError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Delete
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={onClose} className="btn-ghost px-4">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !form.title.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}