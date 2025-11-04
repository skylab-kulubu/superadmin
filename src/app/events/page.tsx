import { AppShell } from '@/components/layout/AppShell';
import { getEvents } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { EventDto } from '@/types/api';

export default async function EventsPage() {
  let events: EventDto[] = [];
  let error: string | null = null;

  try {
    events = await getEvents();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Etkinlikler yüklenirken hata oluştu';
    console.error('Events page error:', err);
  }

  // Format data for display (server-side)
  const formattedEvents = events.map(event => ({
    ...event,
    startDateFormatted: event.startDate ? new Date(event.startDate).toLocaleDateString('tr-TR') : '',
    eventTypeName: event.type?.name || '-',
    statusText: event.active ? 'Aktif' : 'Pasif',
  }));

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Etkinlikler</h1>
          <Link href="/events/new">
            <Button>Yeni Etkinlik</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz etkinlik bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedEvents}
            columns={[
              { key: 'name', header: 'Ad' },
              { key: 'location', header: 'Konum' },
              { key: 'startDateFormatted', header: 'Başlangıç' },
              { key: 'eventTypeName', header: 'Tip' },
              { key: 'statusText', header: 'Durum' },
            ]}
            idKey="id"
          />
        )}
      </div>
    </AppShell>
  );
}
