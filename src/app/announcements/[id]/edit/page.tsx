'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { z } from 'zod';
import { announcementsApi } from '@/lib/api/announcements';
import { eventTypesApi } from '@/lib/api/event-types';
import type { AnnouncementDto } from '@/types/api';

const announcementSchema = z.object({
  title: z.string().min(2, 'En az 2 karakter olmalı'),
  body: z.string().min(2, 'En az 2 karakter olmalı'),
  active: z.boolean().optional(),
  eventTypeId: z.string().min(1, 'Etkinlik tipi seçiniz'),
  formUrl: z.string().url().optional().or(z.literal('')),
  coverImage: z.custom<File | undefined>((val) => val === undefined || val instanceof File).optional(),
});

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [announcement, setAnnouncement] = useState<AnnouncementDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        announcementsApi.getById(id, { includeEventType: true }),
        eventTypesApi.getAll(),
      ]).then(([announcementResponse, eventTypesResponse]) => {
        if (announcementResponse.success && announcementResponse.data) {
          setAnnouncement(announcementResponse.data);
          setIsActive(announcementResponse.data.active ?? true);
        } else {
          setError('Duyuru bulunamadı');
        }
        if (eventTypesResponse.success && eventTypesResponse.data) {
          setEventTypes(eventTypesResponse.data.map((et) => ({ value: et.id, label: et.name })));
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Announcement fetch error:', err);
        setError('Duyuru yüklenirken hata oluştu');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof announcementSchema>) => {
    startTransition(async () => {
      try {
        await announcementsApi.update(id, {
          title: data.title,
          body: data.body,
          active: isActive,
          eventTypeId: data.eventTypeId,
          formUrl: data.formUrl || undefined,
        });
        router.push('/announcements');
      } catch (error) {
        console.error('Announcement update error:', error);
        alert('Duyuru güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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

  if (error || !announcement) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error || 'Duyuru bulunamadı'}</p>
            <Button href="/announcements" variant="secondary" className="mt-4">
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
          title="Duyuru Düzenle"
          description={announcement.title}
          actions={<Toggle checked={isActive} onChange={setIsActive} />}
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
        <Form 
          schema={announcementSchema} 
          onSubmit={handleSubmit} 
          defaultValues={{ 
            title: announcement.title,
            body: announcement.body,
            eventTypeId: announcement.eventType?.id || '',
            formUrl: announcement.formUrl || '',
            coverImage: undefined,
          }}
        >
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
                      <h3 className="text-sm font-semibold text-dark-800 mb-3">Temel Bilgiler</h3>
                <div className="space-y-4">
                  <TextField name="title" label="Başlık" required placeholder="Önemli Duyuru Başlığı" />
                  <Textarea name="body" label="İçerik" rows={6} required placeholder="Duyuru içeriği..." />
                      </div>
                    </div>

                    <div className="border-t border-dark-200 pt-5">
                      <h3 className="text-sm font-semibold text-dark-800 mb-3">Ek Bilgiler</h3>
                      <div className="grid grid-cols-2 gap-4">
                  <Select 
                    name="eventTypeId" 
                    label="Etkinlik Tipi" 
                    options={eventTypes}
                    required 
                  />
                  <TextField name="formUrl" label="Form URL" type="url" placeholder="https://forms.google.com/..." />
                  <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                      </div>
                    </div>
                </div>
                  <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                    <Button href="/announcements" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                      İptal
                    </Button>
                    <Button type="submit" disabled={isPending} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
                    {isPending ? 'Güncelleniyor...' : 'Güncelle'}
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

