'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
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
      <div className="space-y-6">
        <PageHeader
          title="Yeni Etkinlik Tipi"
          description="Sisteme yeni etkinlik tipi ekleyin"
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
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
                  <div className="space-y-5">
                    <div>
                  <TextField name="name" label="Ad" required placeholder="Workshop, Seminer, vb." />
                </div>
                  </div>
                  <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                    <Button href="/event-types" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                      İptal
                    </Button>
                    <Button type="submit" disabled={isPending} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
        </div>
        </div>
      </div>
    </AppShell>
  );
}

