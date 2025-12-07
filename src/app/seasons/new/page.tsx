'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { DatePicker } from '@/components/forms/DatePicker';
import { Checkbox } from '@/components/forms/Checkbox';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { seasonsApi } from '@/lib/api/seasons';
import { convertGMT3ToGMT0, getCurrentDateTimeGMT3 } from '@/lib/utils/date';

const seasonSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean().optional(),
});

export default function NewSeasonPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: z.infer<typeof seasonSchema>) => {
    startTransition(async () => {
      try {
        await seasonsApi.create({
          name: data.name,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: convertGMT3ToGMT0(data.endDate),
          active: true,
        });
        router.push('/seasons');
      } catch (error) {
        console.error('Season creation error:', error);
        alert(
          'Sezon oluşturulurken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Sezon" description="Sisteme yeni sezon ekleyin" />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={seasonSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              startDate: getCurrentDateTimeGMT3(),
              endDate: getCurrentDateTimeGMT3(),
            }}
          >
            {(methods) => {
              const formErrors = methods.formState.errors;
              return (
                <>
                  {Object.keys(formErrors).length > 0 && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-medium text-red-800">Form hataları:</p>
                      <ul className="list-inside list-disc text-sm text-red-600">
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
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Temel Bilgiler</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <TextField name="name" label="Ad" required placeholder="2024-2025" />
                        <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                        <DatePicker name="endDate" label="Bitiş Tarihi" required />
                      </div>
                    </div>
                  </div>
                  <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                    <Button
                      href="/seasons"
                      variant="secondary"
                      className="border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="!text-brand hover:!bg-brand border-brand !bg-transparent hover:!text-white"
                    >
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
  );
}
