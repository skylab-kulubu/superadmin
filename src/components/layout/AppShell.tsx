'use client';

import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-light">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-light">
        <main className="flex-1 overflow-y-auto bg-light text-dark">
          <div className="max-w-6xl w-full mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

