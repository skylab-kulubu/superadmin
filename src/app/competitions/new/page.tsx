'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/forms/Checkbox';
import { z } from 'zod';
import { competitionsApi } from '@/lib/api/competitions';
import { eventTypesApi } from '@/lib/api/event-types';

const competitionSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean().optional(),
  eventTypeId: z.string().optional(),
});

export default function NewCompetitionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    eventTypesApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEventTypes(response.data.map((et) => ({ value: et.id, label: et.name })));
      }
    });
  }, []);

  const handleSubmit = async (data: z.infer<typeof competitionSchema>) => {
    startTransition(async () => {
      try {
        await competitionsApi.create({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        });
        router.push('/competitions');
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Yarışma</h1>
        <Form schema={competitionSchema} onSubmit={handleSubmit}>
          {(methods) => (
            <>
              <div className="space-y-4">
                <TextField name="name" label="Ad" required placeholder="Hackathon 2024" />
                <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                <DatePicker name="endDate" label="Bitiş Tarihi" required />
                {eventTypes.length > 0 && (
                  <Select name="eventTypeId" label="Etkinlik Tipi" options={eventTypes} />
                )}
                <Checkbox name="active" label="Aktif" />
              </div>
              <div className="mt-6 flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button href="/competitions" variant="secondary">
                  İptal
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppShell>
  );
}


