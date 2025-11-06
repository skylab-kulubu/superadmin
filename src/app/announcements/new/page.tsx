'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
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
  coverImage: z.custom<File | undefined>((val) => val === undefined || val instanceof File).optional(),
});

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    eventTypesApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEventTypes(response.data.map((et) => ({ value: et.id, label: et.name })));
      }
    }).catch((error) => {
      console.error('Event types fetch error:', error);
    });
  }, []);

  const handleSubmit = async (data: z.infer<typeof announcementSchema>) => {
    startTransition(async () => {
      try {
        await announcementsApi.create({
          title: data.title,
          body: data.body,
          active: data.active,
          eventTypeId: data.eventTypeId,
          formUrl: data.formUrl || undefined,
        }, data.coverImage);
        router.push('/announcements');
      } catch (error) {
        console.error('Announcement creation error:', error);
        alert('Duyuru oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Duyuru</h1>
        <Form schema={announcementSchema} onSubmit={handleSubmit} defaultValues={{ eventTypeId: '' }}>
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
                  <TextField name="title" label="Başlık" required placeholder="Önemli Duyuru Başlığı" />
                  <Textarea name="body" label="İçerik" rows={6} required placeholder="Duyuru içeriği..." />
                  <Select 
                    name="eventTypeId" 
                    label="Etkinlik Tipi" 
                    options={eventTypes}
                    required 
                  />
                  <TextField name="formUrl" label="Form URL" type="url" placeholder="https://forms.google.com/..." />
                  <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                  <Checkbox name="active" label="Aktif" />
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button href="/announcements" variant="secondary">
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

