'use client';

import { useState, useTransition, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

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
import { getLeaderEventType } from '@/lib/utils/permissions';
import { UserDto, CompetitorDto } from '@/types/api';

const competitorSchema = z.object({
  userId: z.string().min(1, 'Kullanıcı seçiniz'),
  eventId: z.string().min(1, 'Etkinlik seçiniz'),
  points: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Puan 0 veya daha büyük olmalı').optional(),
  ),
  winner: z.boolean().optional(),
});

export default function EditCompetitorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isPending, startTransition] = useTransition();
  const [competitor, setCompetitor] = useState<CompetitorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [events, setEvents] = useState<{ value: string; label: string; type?: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  useEffect(() => {
    // Fetch user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('User fetch error:', err));

    if (id) {
      Promise.all([
        competitorsApi.getById(id, { includeUser: true, includeEvent: true }),
        usersApi.getAll(),
        eventsApi.getAll({ includeEventType: true }),
      ])
        .then(([competitorResponse, usersResponse, eventsResponse]) => {
          if (competitorResponse.success && competitorResponse.data) {
            setCompetitor(competitorResponse.data);
          } else {
            setError('Yarışmacı bulunamadı');
          }
          if (usersResponse.success && usersResponse.data) {
            setUsers(
              usersResponse.data.map((user) => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName}`,
              })),
            );
          }
          if (eventsResponse.success && eventsResponse.data) {
            setEvents(
              eventsResponse.data.map((event) => ({
                value: event.id,
                label: event.name,
                type: event.type?.name,
              })),
            );
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Competitor fetch error:', err);
          setError('Yarışmacı yüklenirken hata oluştu');
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof competitorSchema>) => {
    // Permission check
    if (currentUser) {
      const leaderType = getLeaderEventType(currentUser);
      if (leaderType) {
        const selectedEvent = events.find((e) => e.value === data.eventId);

        if (selectedEvent && selectedEvent.type !== leaderType) {
          alert('Bu etkinlik için yarışmacı düzenleme yetkiniz yok.');
          return;
        }
      }
    }

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
        alert(
          'Yarışmacı güncellenirken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="py-8 text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Yarışmacı bulunamadı'}</p>
          <Button href="/competitors" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  // Filter events for leader
  const filteredEvents =
    currentUser && getLeaderEventType(currentUser)
      ? events.filter((e) => e.type === getLeaderEventType(currentUser))
      : events;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yarışmacı Düzenle"
        description={
          competitor.user ? `${competitor.user.firstName} ${competitor.user.lastName}` : undefined
        }
      />
      <div className="mx-auto max-w-2xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
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
                  <div className="space-y-4">
                    <Select name="userId" label="Kullanıcı" options={users} required />
                    <Select name="eventId" label="Etkinlik" options={filteredEvents} required />
                    <TextField name="points" label="Puan" type="number" placeholder="100" />
                    <div className="flex items-end">
                      <Checkbox name="winner" label="Kazanan" />
                    </div>
                  </div>
                  <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                    <Button
                      href="/competitors"
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
  );
}
