'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/forms/Checkbox';
import { z } from 'zod';
import { competitionsApi } from '@/lib/api/competitions';
import { eventTypesApi } from '@/lib/api/event-types';
import { convertGMT3ToGMT0, getCurrentDateTimeGMT3 } from '@/lib/utils/date';

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
          name: data.name,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: convertGMT3ToGMT0(data.endDate),
          active: true,
          eventTypeId: data.eventTypeId || undefined,
        });
        router.push('/competitions');
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Yeni Yarışma"
          description="Sisteme yeni yarışma ekleyin"
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
          <Form schema={competitionSchema} onSubmit={handleSubmit} defaultValues={{
            startDate: getCurrentDateTimeGMT3(),
            endDate: getCurrentDateTimeGMT3(),
          }}>
          {(methods) => (
            <>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-dark-800 mb-3">Temel Bilgiler</h3>
                    <div className="grid grid-cols-2 gap-4">
                <TextField name="name" label="Ad" required placeholder="Hackathon 2024" />
                {eventTypes.length > 0 && (
                  <Select name="eventTypeId" label="Etkinlik Tipi" options={eventTypes} />
                )}
                      <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                      <DatePicker name="endDate" label="Bitiş Tarihi" required />
                    </div>
                  </div>
              </div>
                <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                  <Button href="/competitions" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                    İptal
                  </Button>
                  <Button type="submit" disabled={isPending} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </>
          )}
        </Form>
        </div>
        </div>
      </div>
    </AppShell>
  );
}


