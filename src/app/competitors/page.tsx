import { AppShell } from '@/components/layout/AppShell';
import { getCompetitors } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { CompetitorDto } from '@/types/api';

export default async function CompetitorsPage() {
  let competitors: CompetitorDto[] = [];
  let error: string | null = null;

  try {
    competitors = await getCompetitors({ includeUser: true, includeEvent: true });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Yarışmacılar yüklenirken hata oluştu';
    console.error('Competitors page error:', err);
  }

  // Format data for display (server-side)
  const formattedCompetitors = competitors.map(competitor => ({
    ...competitor,
    userName: competitor.user ? `${competitor.user.firstName} ${competitor.user.lastName}` : '-',
    eventName: competitor.event?.name || '-',
    winnerText: competitor.winner ? 'Evet' : 'Hayır',
  }));

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Yarışmacılar</h1>
          <Link href="/competitors/new">
            <Button>Yeni Yarışmacı</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : competitors.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz yarışmacı bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedCompetitors}
            columns={[
              { key: 'userName', header: 'Kullanıcı' },
              { key: 'eventName', header: 'Etkinlik' },
              { key: 'points', header: 'Puan' },
              { key: 'winnerText', header: 'Kazanan' },
            ]}
            idKey="id"
          />
        )}
      </div>
    </AppShell>
  );
}
