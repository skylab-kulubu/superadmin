'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        router.push('/login');
      }
    }

    checkAuth();
  }, [router]);

  // Loading state - middleware zaten kontrol ediyor ama client-side guard için loading göster
  if (isAuthenticated === null) {
    return null; // veya bir loading spinner gösterilebilir
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

