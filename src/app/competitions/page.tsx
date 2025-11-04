import { AppShell } from '@/components/layout/AppShell';
import { getCompetitions } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { CompetitionDto } from '@/types/api';

export default async function CompetitionsPage() {
  let competitions: CompetitionDto[] = [];
  let error: string | null = null;

  try {
    competitions = await getCompetitions();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Yarışmalar yüklenirken hata oluştu';
    console.error('Competitions page error:', err);
  }

  // Format data for display (server-side)
  const formattedCompetitions = competitions.map(comp => ({
    ...comp,
    startDateFormatted: comp.startDate ? new Date(comp.startDate).toLocaleDateString('tr-TR') : '',
    endDateFormatted: comp.endDate ? new Date(comp.endDate).toLocaleDateString('tr-TR') : '',
    statusText: comp.active ? 'Aktif' : 'Pasif',
  }));

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Yarışmalar</h1>
          <Link href="/competitions/new">
            <Button>Yeni Yarışma</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : competitions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz yarışma bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedCompetitions}
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

