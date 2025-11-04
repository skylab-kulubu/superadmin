import { AppShell } from '@/components/layout/AppShell';
import { getSessions } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { SessionDto } from '@/types/api';

export default async function SessionsPage() {
  let sessions: SessionDto[] = [];
  let error: string | null = null;

  try {
    sessions = await getSessions({ includeEvent: true });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Oturumlar yüklenirken hata oluştu';
    console.error('Sessions page error:', err);
  }

  // Format data for display (server-side)
  const formattedSessions = sessions.map(session => ({
    ...session,
    startTimeFormatted: session.startTime ? new Date(session.startTime).toLocaleString('tr-TR') : '',
    endTimeFormatted: session.endTime ? new Date(session.endTime).toLocaleString('tr-TR') : '-',
  }));

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Oturumlar</h1>
          <Link href="/sessions/new">
            <Button>Yeni Oturum</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz oturum bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedSessions}
            columns={[
              { key: 'title', header: 'Başlık' },
              { key: 'speakerName', header: 'Konuşmacı' },
              { key: 'startTimeFormatted', header: 'Başlangıç' },
              { key: 'endTimeFormatted', header: 'Bitiş' },
              { key: 'sessionType', header: 'Tip' },
            ]}
            idKey="id"
          />
        )}
      </div>
    </AppShell>
  );
}
