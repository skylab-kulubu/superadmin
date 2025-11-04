import { AppShell } from '@/components/layout/AppShell';
import { getAnnouncements } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { AnnouncementDto } from '@/types/api';

export default async function AnnouncementsPage() {
  let announcements: AnnouncementDto[] = [];
  let error: string | null = null;

  try {
    announcements = await getAnnouncements({ includeEventType: true });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Duyurular yüklenirken hata oluştu';
    console.error('Announcements page error:', err);
  }

  // Format data for display (server-side)
  const formattedAnnouncements = announcements.map(announcement => ({
    ...announcement,
    bodyPreview: announcement.body ? announcement.body.substring(0, 50) + '...' : '',
    statusText: announcement.active ? 'Aktif' : 'Pasif',
    eventTypeName: announcement.eventType?.name || '-',
  }));

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Duyurular</h1>
          <Link href="/announcements/new">
            <Button>Yeni Duyuru</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700 mb-4">{error}</p>
            {error.includes('403') || error.includes('yetkiniz') ? (
              <div className="text-sm text-red-600">
                <p className="mb-2">Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.</p>
                <p className="mt-2 text-xs text-gray-600">
                  Bu endpoint için backend SecurityConfig'de izin tanımlanmamış olabilir.
                </p>
                <p className="mt-3">Lütfen yöneticinizle iletişime geçin.</p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            )}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz duyuru bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedAnnouncements}
            columns={[
              { key: 'title', header: 'Başlık' },
              { key: 'bodyPreview', header: 'İçerik' },
              { key: 'statusText', header: 'Durum' },
              { key: 'eventTypeName', header: 'Etkinlik Tipi' },
            ]}
            idKey="id"
          />
        )}
      </div>
    </AppShell>
  );
}
