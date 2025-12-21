'use client';

import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SeasonDto } from '@/types/api';
import { seasonsApi } from '@/lib/api/seasons';

export default function SeasonsPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSeasons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await seasonsApi.getAll();
      if (response.success && response.data) {
        setSeasons(response.data);
      } else {
        setError(response.message || 'Sezonlar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sezonlar yüklenirken hata oluştu');
      console.error('Seasons page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleEdit = (season: SeasonDto) => {
    router.push(`/seasons/${season.id}/edit`);
  };

  // Format data for display
  const formattedSeasons = seasons.map((season) => ({
    ...season,
    startDateFormatted: season.startDate
      ? new Date(season.startDate).toLocaleDateString('tr-TR')
      : '',
    endDateFormatted: season.endDate ? new Date(season.endDate).toLocaleDateString('tr-TR') : '',
    statusText: season.active ? 'Aktif' : 'Pasif',
  }));

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Sezonlar</h1>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Sezonlar"
          description="Sezonları görüntüleyin ve yönetin"
          actions={
            <Link href="/seasons/new">
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
                  Yeni Sezon
                </span>
              </Button>
            </Link>
          }
        />
        {error ? (
          <div className="bg-light border-dark-200 rounded-lg border p-6">
            <h2 className="text-brand mb-2 text-lg font-semibold">Hata</h2>
            <p className="text-dark mb-4">{error}</p>
          </div>
        ) : seasons.length === 0 ? (
          <div className="bg-light border-dark-200 rounded-lg border p-6 text-center">
            <p className="text-dark opacity-60">Henüz sezon bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {seasons.map((s) => (
              <div
                key={s.id}
                onClick={() => handleEdit(s)}
                className="bg-light border-dark-200 hover:bg-brand-50 hover:border-brand flex cursor-pointer items-center justify-between rounded-md border p-3 transition"
              >
                <div className="min-w-0">
                  <div className="text-dark-900 truncate text-sm font-medium">{s.name}</div>
                  <div className="text-dark-600 truncate text-xs">
                    {s.startDate ? new Date(s.startDate).toLocaleDateString('tr-TR') : ''} -{' '}
                    {s.endDate ? new Date(s.endDate).toLocaleDateString('tr-TR') : '-'}
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.active ? 'bg-brand-100 text-brand-700 border-brand-200/50' : 'bg-dark-100 text-dark-600 border-dark-200/50'}`}
                >
                  {s.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
