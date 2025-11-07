'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Select } from '@/components/forms/Select';
import { Checkbox } from '@/components/forms/Checkbox';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { competitorsApi } from '@/lib/api/competitors';
import { usersApi } from '@/lib/api/users';
import { eventsApi } from '@/lib/api/events';
import type { CompetitorDto } from '@/types/api';

const competitorSchema = z.object({
  userId: z.string().min(1, 'Kullanıcı seçiniz'),
  eventId: z.string().min(1, 'Etkinlik seçiniz'),
  points: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Puan 0 veya daha büyük olmalı').optional()
  ),
  winner: z.boolean().optional(),
});

export default function EditCompetitorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [competitor, setCompetitor] = useState<CompetitorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [events, setEvents] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (id) {
      Promise.all([
        competitorsApi.getById(id, { includeUser: true, includeEvent: true }),
        usersApi.getAll(),
        eventsApi.getAll(),
      ]).then(([competitorResponse, usersResponse, eventsResponse]) => {
        if (competitorResponse.success && competitorResponse.data) {
          setCompetitor(competitorResponse.data);
        } else {
          setError('Yarışmacı bulunamadı');
        }
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data.map((user) => ({ value: user.id, label: `${user.firstName} ${user.lastName}` })));
        }
        if (eventsResponse.success && eventsResponse.data) {
          setEvents(eventsResponse.data.map((event) => ({ value: event.id, label: event.name })));
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Competitor fetch error:', err);
        setError('Yarışmacı yüklenirken hata oluştu');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof competitorSchema>) => {
    startTransition(async () => {
      try {
        await competitorsApi.update(id, {
          userId: data.userId,
          eventId: data.eventId,
          points: data.points,
          winner: data.winner,
        });
        router.push('/competitors');
      } catch (error) {
        console.error('Competitor update error:', error);
        alert('Yarışmacı güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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

  if (error || !competitor) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error || 'Yarışmacı bulunamadı'}</p>
            <Button href="/competitors" variant="secondary" className="mt-4">
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
          title="Yarışmacı Düzenle"
          description={competitor.user ? `${competitor.user.firstName} ${competitor.user.lastName}` : undefined}
        />
        <div className="max-w-2xl mx-auto">
        <Form 
          schema={competitorSchema} 
          onSubmit={handleSubmit} 
          defaultValues={{ 
            userId: competitor.user?.id || '',
            eventId: competitor.event?.id || '',
            points: competitor.points ?? undefined,
            winner: competitor.winner || false,
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
                <div className="space-y-4">
                  <Select 
                    name="userId" 
                    label="Kullanıcı" 
                    options={users}
                    required 
                  />
                  <Select 
                    name="eventId" 
                    label="Etkinlik" 
                    options={events}
                    required 
                  />
                  <TextField name="points" label="Puan" type="number" placeholder="100" />
                  <Checkbox name="winner" label="Kazanan" />
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                  <Button href="/competitors" variant="secondary">
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

