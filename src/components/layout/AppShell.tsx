'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-lacivert">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-lacivert">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-lacivert text-pembe">
          {children}
        </main>
      </div>
    </div>
  );
}

