'use client';

import { useSession, signOut } from '@lib/auth-client';
import { useWorkspaceStore } from '@stores/workspace-store';
import { Button } from '@components/ui/button';
import { Menu, LogOut, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const workspaceName = useWorkspaceStore((s) => s.currentWorkspaceName);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          {workspaceName && (
            <span className="text-sm font-medium text-gray-500">{workspaceName}</span>
          )}
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-x-3">
            <span className="text-sm font-medium text-gray-900">
              {session?.user?.name || session?.user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
