'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';
import { useBoards } from '@/hooks/useBoards';
import { Board } from '@/types';
import CreateBoardModal from '@/components/board/CreateBoardModal';

const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

export default function DashboardPage() {
  const { user } = useTenant();
  const { boards, isLoading, createBoard, deleteBoard } = useBoards();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this board and all its todos?')) return;
    setDeletingId(id);
    try {
      await deleteBoard(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {boards.length} board{boards.length !== 1 ? 's' : ''} in{' '}
            <span className="text-indigo-400 font-medium">{user?.tenantName}</span>
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Board
        </button>
      </div>

      {/* Boards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-gray-800/30" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-1">No boards yet</h3>
          <p className="text-gray-500 text-sm mb-4">Create your first board to start organizing tasks</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              isDeleting={deletingId === board.id}
              onClick={() => router.push(`/dashboard/board/${board.id}`)}
              onDelete={(e) => handleDelete(e, board.id)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBoardModal
          colors={BOARD_COLORS}
          onCreate={createBoard}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function BoardCard({
  board,
  isDeleting,
  onClick,
  onDelete,
}: {
  board: Board;
  isDeleting: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      className="card group relative cursor-pointer hover:border-white/12 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 overflow-hidden"
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: board.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-100 truncate">{board.name}</h3>
            {board.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{board.description}</p>
            )}
          </div>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 ml-2 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Delete board"
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
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {board.todoCount ?? 0} tasks
          </span>
          <span>
            {new Date(board.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}