'use client';

import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveWorkspace, setWorkspaces } from '@/store/slices/workspaceSlice';
import { trpc } from '@/utils/trpc';
import { ChevronDown, Plus, Check, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkspaceSwitcher() {
  const dispatch = useDispatch();
  const { workspaces, activeWorkspaceId } = useSelector((s) => s.workspace);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const activeWorkspace = workspaces.find((w) => w.workspaceId === activeWorkspaceId);

  // Refetch workspaces helper
  const workspacesQuery = trpc.workspace.getMyWorkspaces.useQuery(undefined, {
    enabled: false, // Manual refetch only
  });

  const createMutation = trpc.workspace.createWorkspace.useMutation({
    onSuccess: async () => {
      setNewName('');
      setIsCreating(false);
      const result = await workspacesQuery.refetch();
      if (result.data) {
        dispatch(setWorkspaces(result.data));
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewName('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  function handleSwitch(workspaceId) {
    dispatch(setActiveWorkspace(workspaceId));
    setIsOpen(false);
  }

  function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createMutation.mutate({ name: trimmed });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewName('');
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="workspace-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
      >
        <Building2 className="size-4 text-slate-500" />
        <span className="max-w-[140px] truncate">
          {activeWorkspace?.workspaceName || 'Select Workspace'}
        </span>
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 border-2 border-slate-200 bg-white shadow-sm">
          {/* Workspace List */}
          <div className="max-h-64 overflow-y-auto">
            {workspaces.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                No workspaces yet
              </div>
            ) : (
              workspaces.map((ws) => (
                <button
                  key={ws.workspaceId}
                  onClick={() => handleSwitch(ws.workspaceId)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50 ${
                    ws.workspaceId === activeWorkspaceId
                      ? 'bg-slate-950 text-white hover:bg-slate-900'
                      : 'text-slate-950'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[160px]">
                      {ws.workspaceName}
                    </span>
                    <span
                      className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        ws.workspaceId === activeWorkspaceId
                          ? 'text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {ws.role}
                    </span>
                  </div>
                  {ws.workspaceId === activeWorkspaceId && (
                    <Check className="size-4 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Separator */}
          <div className="border-t-2 border-slate-200" />

          {/* Create New */}
          {isCreating ? (
            <div className="p-3">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Workspace name…"
                maxLength={100}
                className="w-full border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || createMutation.isLoading}
                  className="flex-1 bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
                >
                  {createMutation.isLoading ? 'Creating…' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewName('');
                  }}
                  className="border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-50"
            >
              <Plus className="size-4" />
              New Workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}
