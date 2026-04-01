'use client';

import { Todo, TodoStatus } from '@/types';
import TodoCard from './TodoCard';

interface TodoColumnProps {
  status: TodoStatus;
  label: string;
  color: string;
  todos: Todo[];
  isLoading: boolean;
  onAddClick: () => void;
  onTodoClick: (todo: Todo) => void;
  onStatusChange: (todo: Todo, status: TodoStatus) => void;
  onDelete: (todoId: string) => void;
}

export default function TodoColumn({
  status,
  label,
  color,
  todos,
  isLoading,
  onAddClick,
  onTodoClick,
  onStatusChange,
  onDelete,
}: TodoColumnProps) {
  return (
    <div className="flex flex-col w-72 shrink-0 h-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <span className="text-sm font-semibold text-gray-300">{label}</span>
          <span className="text-xs bg-gray-800 text-gray-500 rounded-full px-2 py-0.5 font-medium">
            {todos.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1 text-gray-600 hover:text-indigo-400 transition-colors rounded"
          title={`Add to ${label}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-gray-900/40 p-2 space-y-2 min-h-30 border border-white/4">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-gray-800/40 animate-pulse"
            />
          ))
        ) : todos.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-gray-700 italic">Drop tasks here</p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onClick={() => onTodoClick(todo)}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        )}

        {/* Add button at bottom of column */}
        <button
          onClick={onAddClick}
          className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 hover:bg-white/3 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      </div>
    </div>
  );
}