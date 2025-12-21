'use client';

import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AnnouncementDto } from '@/types/api';
import { announcementsApi } from '@/lib/api/announcements';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await announcementsApi.getAll({ includeEventType: true });
      if (response.success && response.data) {
        setAnnouncements(response.data);
      } else {
        setError(response.message || 'Duyurular yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyurular yüklenirken hata oluştu');
      console.error('Announcements page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleEdit = (announcement: AnnouncementDto) => {
    router.push(`/announcements/${announcement.id}/edit`);
  };

  // Format data for display
  const formattedAnnouncements = announcements.map((announcement) => ({
    ...announcement,
    bodyPreview: announcement.body ? announcement.body.substring(0, 50) + '...' : '',
    statusText: announcement.active ? 'Aktif' : 'Pasif',
    eventTypeName: announcement.eventType?.name || '-',
  }));

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Duyurular</h1>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Duyurular"
          description="Duyuruları görüntüleyin ve yönetin"
          actions={
            <Link href="/announcements/new">
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
                  Yeni Duyuru
                </span>
              </Button>
            </Link>
          }
        />
        {announcements.length === 0 ? (
          <div className="bg-light border-dark-200 rounded-lg border p-6 text-center">
            <p className="text-dark opacity-60">Henüz duyuru bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                onClick={() => handleEdit(a)}
                className="bg-light border-dark-200 hover:bg-brand-50 hover:border-brand cursor-pointer rounded-md border p-3 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-dark-900 truncate text-sm font-medium">{a.title}</div>
                    <div className="text-dark-600 truncate text-xs">
                      {a.eventType?.name || '-'} • {(a.body || '').slice(0, 60)}
                      {(a.body || '').length > 60 ? '…' : ''}
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${a.active ? 'bg-brand-100 text-brand-700 border-brand-200/50' : 'bg-dark-100 text-dark-600 border-dark-200/50'}`}
                  >
                    {a.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
