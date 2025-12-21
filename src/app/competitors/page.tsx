'use client';

import { useState, useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CompetitorDto } from '@/types/api';
import { competitorsApi } from '@/lib/api/competitors';
import { getLeaderEventType } from '@/lib/utils/permissions';
import { CompetitorsGridClient } from './CompetitorsGridClient';

export default function CompetitorsPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user first
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('User fetch error:', err));
  }, []);

  const loadCompetitors = async () => {
    if (!currentUser) return; // Wait for user

    setLoading(true);
    setError(null);
    try {
      const response = await competitorsApi.getAll({ includeUser: true, includeEvent: true });
      if (response.success && response.data) {
        let data = response.data;

        // Filter for leaders
        const leaderEventType = getLeaderEventType(currentUser);

        if (leaderEventType) {
          data = data.filter((c) => c.event?.type?.name === leaderEventType);
        }

        setCompetitors(data);
      } else {
        setError(response.message || 'Yarışmacılar yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Yarışmacılar yüklenirken hata oluştu';
      // 403 hatası için özel mesaj
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError(
          'Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.',
        );
      } else {
        setError(errorMessage);
      }
      console.error('Competitors page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCompetitors();
    }
  }, [currentUser]);

  // Group competitors by Event Name
  const competitorsByEvent = useMemo(() => {
    const grouped: Record<string, CompetitorDto[]> = {};
    competitors.forEach((comp) => {
      const eventName = comp.event?.name || 'Etkinliksiz';
      if (!grouped[eventName]) {
        grouped[eventName] = [];
      }
      grouped[eventName].push(comp);
    });
    return grouped;
  }, [competitors]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Yarışmacılar</h1>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Yarışmacılar"
          description="Tüm yarışmacıları görüntüleyin ve yönetin"
          actions={
            <Link href="/competitors/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Yeni Yarışmacı
                </span>
              </Button>
            </Link>
          }
        />

        {/* Error State */}
        {error ? (
          <div className="bg-light border-danger rounded-lg border-l-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-danger-100 flex h-10 w-10 items-center justify-center rounded-full">
                  <svg
                    className="text-danger-700 h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-danger-800 mb-2 text-lg font-semibold">Hata Oluştu</h2>
                <p className="text-dark-700 mb-4">{error}</p>
              </div>
            </div>
          </div>
        ) : competitors.length === 0 ? (
          /* Empty State */
          <div className="bg-light border-dark-200/50 rounded-xl border p-12 text-center shadow-lg">
            <div className="mx-auto max-w-md">
              <div className="bg-brand-100 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <svg
                  className="text-brand-600 h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-dark-800 mb-2 text-xl font-semibold">Henüz yarışmacı yok</h3>
              <p className="text-dark-600 mb-6">Sisteme ilk yarışmacıyı ekleyerek başlayın</p>
              <Link href="/competitors/new">
                <Button>
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    İlk Yarışmacıyı Ekle
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Competitors Grid */
          <CompetitorsGridClient competitorsByEvent={competitorsByEvent} />
        )}
      </div>
    </>
  );
}
