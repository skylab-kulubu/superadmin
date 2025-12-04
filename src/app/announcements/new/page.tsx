'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Checkbox } from '@/components/forms/Checkbox';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { announcementsApi } from '@/lib/api/announcements';
import { eventTypesApi } from '@/lib/api/event-types';

const announcementSchema = z.object({
  title: z.string().min(2, 'En az 2 karakter olmalı'),
  body: z.string().min(2, 'En az 2 karakter olmalı'),
  active: z.boolean().optional(),
  eventTypeId: z.string().min(1, 'Etkinlik tipi seçiniz'),
  formUrl: z.string().url().optional().or(z.literal('')),
  coverImage: z
    .custom<File | undefined>((val) => val === undefined || val instanceof File)
    .optional(),
});

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    eventTypesApi
      .getAll()
      .then((response) => {
        if (response.success && response.data) {
          setEventTypes(response.data.map((et) => ({ value: et.id, label: et.name })));
        }
      })
      .catch((error) => {
        console.error('Event types fetch error:', error);
      });
  }, []);

  const handleSubmit = async (data: z.infer<typeof announcementSchema>) => {
    startTransition(async () => {
      try {
        const announcementData = {
          title: data.title,
          body: data.body,
          active: true,
          eventTypeId: data.eventTypeId,
          formUrl: data.formUrl || undefined,
        };

        // Backend expects 'data' as a JSON string and 'coverImage' as a file in multipart/form-data
        // The api client handles the FormData creation, we just pass the object and file
        await announcementsApi.create(announcementData, data.coverImage);

        router.push('/announcements');
      } catch (error) {
        console.error('Announcement creation error:', error);
        alert(
          'Duyuru oluşturulurken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Yeni Duyuru" description="Sisteme yeni duyuru ekleyin" />

        <div className="mx-auto max-w-3xl">
          <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
            <Form
              schema={announcementSchema}
              onSubmit={handleSubmit}
              defaultValues={{ eventTypeId: '' }}
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
                        <div className="space-y-4">
                          <TextField
                            name="title"
                            label="Başlık"
                            required
                            placeholder="Önemli Duyuru Başlığı"
                          />
                          <Textarea
                            name="body"
                            label="İçerik"
                            rows={6}
                            required
                            placeholder="Duyuru içeriği..."
                          />
                        </div>
                      </div>

                      <div className="border-dark-200 border-t pt-5">
                        <h3 className="text-dark-800 mb-3 text-sm font-semibold">Ek Bilgiler</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            name="eventTypeId"
                            label="Etkinlik Tipi"
                            options={eventTypes}
                            required
                          />
                          <TextField
                            name="formUrl"
                            label="Form URL"
                            type="url"
                            placeholder="https://forms.google.com/..."
                          />
                          <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                        </div>
                      </div>
                    </div>
                    <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                      <Button
                        href="/announcements"
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
    </AppShell>
  );
}
