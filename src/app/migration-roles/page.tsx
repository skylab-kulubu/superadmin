'use client';

import { useEffect, useState } from 'react';
import { eventTypesApi } from '@/lib/api/event-types';
import { Button } from '@/components/ui/Button';

export default function MigrationPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const runMigration = async () => {
    setStatus('running');
    addLog('Starting migration...');

    try {
      const result = await eventTypesApi.getAll();
      if (!result.success || !result.data) {
        addLog('Failed to fetch event types');
        return;
      }

      const eventTypes = result.data;
      addLog(`Found ${eventTypes.length} event types.`);

      for (const et of eventTypes) {
        addLog(`Processing ${et.name} (${et.id})...`);

        // Mevcut rolleri al (API'den dönen DTO'da authorizedRoles varsa kullan, yoksa boş kabul et)
        // Not: EventTypeDto'da authorizedRoles şu an tanımlı değilse types/api.ts'e eklemek gerekebilir.
        // Ancak curl çıktısında 'authorizedRoles' alanını gördük.
        // Typescript hata verirse ignore ederiz şimdilik.

        const currentRoles: string[] = et.authorizedRoles || [];
        const rolesToAdd = ['ADMIN', 'YK', 'DK'];

        const newRoles = Array.from(new Set([...currentRoles, ...rolesToAdd]));

        if (newRoles.length === currentRoles.length) {
          addLog(`No changes needed for ${et.name}`);
          continue;
        }

        try {
          await eventTypesApi.update(et.id, {
            name: et.name,
            authorizedRoles: newRoles,
          });
          addLog(`Updated ${et.name} with roles: ${newRoles.join(', ')}`);
        } catch (err: any) {
          addLog(`Error updating ${et.name}: ${err.message}`);
        }
      }

      addLog('Migration completed.');
    } catch (err: any) {
      addLog(`Fatal error: ${err.message}`);
    } finally {
      setStatus('done');
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Role Migration Script</h1>
      <div className="mb-4">
        <Button onClick={runMigration} disabled={status === 'running'}>
          {status === 'running' ? 'Running...' : 'Start Migration'}
        </Button>
      </div>
      <div className="h-96 overflow-auto rounded border border-gray-300 bg-gray-100 p-4 font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
