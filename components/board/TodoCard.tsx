'use client';

import { Todo, TodoStatus } from '@/types';

const PRIORITY_STYLES = {
  low: 'text-gray-500 bg-gray-800',
  medium: 'text-yellow-400 bg-yellow-400/10',
  high: 'text-red-400 bg-red-400/10',
};

const STATUS_OPTIONS: { value: TodoStatus; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

interface TodoCardProps {
  todo: Todo;
  onClick: () => void;
  onStatusChange: (todo: Todo, status: TodoStatus) => void;
  onDelete: (todoId: string) => void;
}

export default function TodoCard({
  todo,
  onClick,
  onStatusChange,
  onDelete,
}: TodoCardProps) {
  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onStatusChange(todo, e.target.value as TodoStatus);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${todo.title}"?`)) return;
    onDelete(todo.id);
  };

  return (
    <div
      onClick={onClick}
      className="group bg-gray-800/60 hover:bg-gray-800/80 border border-white/[0.06] rounded-lg p-3 cursor-pointer transition-all duration-150 hover:border-indigo-500/30 hover:shadow-sm animate-slide-in"
    >
      {/* Title + delete */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium text-gray-200 leading-snug flex-1 ${
          todo.status === 'done' ? 'line-through text-gray-500' : ''
        }`}>
          {todo.title}
        </p>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-gray-600 hover:text-red-400 transition-all rounded"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {todo.description && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{todo.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 gap-2">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_STYLES[todo.priority]}`}>
          {todo.priority}
        </span>

        <select
          value={todo.status}
          onChange={handleStatusSelect}
          onClick={(e) => e.stopPropagation()}
          className="text-xs bg-gray-900/60 border border-white/[0.08] rounded px-1.5 py-0.5 text-gray-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Assignee */}
      {todo.assignee && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-5 h-5 rounded-full bg-indigo-600/30 flex items-center justify-center">
            <span className="text-xs text-indigo-300 font-medium">
              {todo.assignee.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-gray-500">{todo.assignee.name}</span>
        </div>
      )}
    </div>
  );
}