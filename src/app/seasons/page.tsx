import { AppShell } from '@/components/layout/AppShell';
import { getSeasons } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { SeasonDto } from '@/types/api';

export default async function SeasonsPage() {
  let seasons: SeasonDto[] = [];
  let error: string | null = null;

  try {
    seasons = await getSeasons();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Sezonlar yüklenirken hata oluştu';
    console.error('Seasons page error:', err);
  }

  // Format data for display (server-side)
  const formattedSeasons = seasons.map(season => ({
    ...season,
    startDateFormatted: season.startDate ? new Date(season.startDate).toLocaleDateString('tr-TR') : '',
    endDateFormatted: season.endDate ? new Date(season.endDate).toLocaleDateString('tr-TR') : '',
    statusText: season.active ? 'Aktif' : 'Pasif',
  }));

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sezonlar</h1>
          <Link href="/seasons/new">
            <Button>Yeni Sezon</Button>
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
        ) : seasons.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz sezon bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedSeasons}
            columns={[
              { key: 'name', header: 'Ad' },
              { key: 'startDateFormatted', header: 'Başlangıç' },
              { key: 'endDateFormatted', header: 'Bitiş' },
              { key: 'statusText', header: 'Durum' },
            ]}
            idKey="id"
          />
        )}
      </div>
    </AppShell>
  );
}
