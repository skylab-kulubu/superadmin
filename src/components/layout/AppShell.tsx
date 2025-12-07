'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';
import { GlobalErrorMessenger } from '@/components/common/GlobalErrorMessenger';
import { MobileSidebarContext } from './MobileSidebarContext';

import { AuthProvider } from '@/context/AuthContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const pathname = usePathname();
  const isPublicPage = pathname?.startsWith('/login');

  if (isPublicPage) {
    return (
      <AuthProvider>
        <GlobalErrorMessenger />
        {children}
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <MobileSidebarContext.Provider
        value={{
          open: () => setIsMobileSidebarOpen(true),
          close: () => setIsMobileSidebarOpen(false),
        }}
      >
        <div className="bg-light flex h-screen">
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
          <div className="bg-light flex flex-1 flex-col overflow-hidden">
            <main className="bg-light text-dark flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-6xl p-6">
                <GlobalErrorMessenger />
                {children}
              </div>
            </main>
          </div>
        </div>
      </MobileSidebarContext.Provider>
    </AuthProvider>
  );
}
