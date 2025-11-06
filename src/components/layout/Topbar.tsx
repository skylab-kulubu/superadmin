'use client';

import { useEffect, useState } from 'react';
import type { UserDto } from '@/types/api';

export function Topbar() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            if (data.user) {
              setUser(data.user);
            } else if (data.error) {
              // Backend down ama authenticated durumda
              setError(data.error);
            }
          }
        } else {
          setError('Kullanıcı bilgileri yüklenemedi');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Kullanıcı bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <div className="h-16 bg-lacivert border-b border-pembe-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-yesil">Admin Panel</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="text-sm text-pembe opacity-60">Yükleniyor...</div>
        ) : error ? (
          <div className="text-sm text-pembe" title={error}>
            ⚠️ Backend erişilemiyor
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.firstName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-yesil flex items-center justify-center text-lacivert text-sm font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-pembe">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-pembe opacity-60">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-pembe opacity-60">Kullanıcı bilgisi yok</div>
        )}
      </div>
    </div>
  );
}

