'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { UserDto } from '@/types/api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      // setLoading(true); // Don't set loading to true on refresh to avoid flickering
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setError(null);
        } else {
          setUser(null);
          // If not authenticated and not on login page, redirect might be handled by middleware or component
        }
      } else {
        setUser(null);
        setError('Kullanıcı bilgileri alınamadı');
      }
    } catch (err) {
      console.error('Auth fetch error:', err);
      setError('Bağlantı hatası');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Redirect logic for basic users
  useEffect(() => {
    if (!loading && user) {
      const isBasicUser = user.roles.length === 1 && user.roles[0] === 'USER';
      if (isBasicUser && pathname !== '/waiting-room' && !pathname?.startsWith('/api')) {
        router.replace('/waiting-room');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
