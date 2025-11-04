'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { eventTypesApi } from '@/lib/api/event-types';

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
});

export default function NewEventTypePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: z.infer<typeof eventTypeSchema>) => {
    startTransition(async () => {
      try {
        await eventTypesApi.create({ name: data.name });
        router.push('/event-types');
      } catch (error) {
        console.error('Event type creation error:', error);
        alert('Etkinlik tipi oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Etkinlik Tipi</h1>
        <Form schema={eventTypeSchema} onSubmit={handleSubmit}>
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
                  <TextField name="name" label="Ad" required />
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
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
    </AppShell>
  );
}

