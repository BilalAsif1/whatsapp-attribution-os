import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceState {
  currentWorkspaceId: string | null;
  currentWorkspaceName: string | null;
  setWorkspace: (id: string, name: string) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      currentWorkspaceName: null,
      setWorkspace: (id, name) => set({ currentWorkspaceId: id, currentWorkspaceName: name }),
      clearWorkspace: () => set({ currentWorkspaceId: null, currentWorkspaceName: null }),
    }),
    { name: 'wao-workspace' },
  ),
);
