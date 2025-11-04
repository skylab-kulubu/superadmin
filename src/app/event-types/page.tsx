import { AppShell } from '@/components/layout/AppShell';
import { getEventTypes } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { EventTypeDto } from '@/types/api';

export default async function EventTypesPage() {
  let eventTypes: EventTypeDto[] = [];
  let error: string | null = null;

  try {
    eventTypes = await getEventTypes();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Etkinlik tipleri yüklenirken hata oluştu';
    console.error('EventTypes page error:', err);
  }

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Etkinlik Tipleri</h1>
          <Link href="/event-types/new">
            <Button>Yeni Etkinlik Tipi</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : eventTypes.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz etkinlik tipi bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={eventTypes}
            columns={[
              { key: 'name', header: 'Ad' },
            ]}
            idKey="id"
          />
        )}
      </div>
    </AppShell>
  );
}
