'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/forms/Checkbox';
import { z } from 'zod';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventTypeDto } from '@/types/api';

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  competitive: z.boolean().optional(),
});

export default function EditEventTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [eventType, setEventType] = useState<EventTypeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      eventTypesApi.getById(id).then((response) => {
        if (response.success && response.data) {
          setEventType(response.data);
        } else {
          setError('Etkinlik tipi bulunamadı');
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Event type fetch error:', err);
        setError('Etkinlik tipi yüklenirken hata oluştu');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof eventTypeSchema>) => {
    startTransition(async () => {
      try {
        await eventTypesApi.update(id, { name: data.name, competitive: data.competitive });
        router.push('/event-types');
      } catch (error) {
        console.error('Event type update error:', error);
        alert('Etkinlik tipi güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">Yükleniyor...</div>
        </div>
      </AppShell>
    );
  }

  if (error || !eventType) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error || 'Etkinlik tipi bulunamadı'}</p>
            <Button href="/event-types" variant="secondary" className="mt-4">
              Geri Dön
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Etkinlik Tipi Düzenle"
          description={eventType.name}
        />
        <div className="max-w-2xl mx-auto">
        <Form schema={eventTypeSchema} onSubmit={handleSubmit} defaultValues={{ name: eventType.name }}>
          {(methods) => {
            const formErrors = methods.formState.errors;
            return (
              <>
                {Object.keys(formErrors).length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-2">Form hataları:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {Object.entries(formErrors).map(([key, error]) => (
                        <li key={key}>
                          {key}: {error?.message as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-4">
                  <TextField name="name" label="Ad" required placeholder="Workshop, Seminer, vb." />
                  <Checkbox name="competitive" label="Rekabetçi" />
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                  <Button href="/event-types" variant="secondary">
                    İptal
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
        </div>
      </div>
    </AppShell>
  );
}

