'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { UserDto } from '@/types/api';

const competitorSchema = z.object({
  userId: z.string().min(1, 'Kullanıcı seçiniz'),
  eventId: z.string().min(1, 'Etkinlik seçiniz'),
  points: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val ? parseFloat(val) : undefined)),
  winner: z.boolean().optional(),
});

export default function NewCompetitorPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

    usersApi
      .getAll()
      .then((response) => {
        if (response.success && response.data) {
          setUsers(
            response.data.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName} (${user.email})`,
            })),
          );
        }
      })
      .catch((error) => {
        console.error('Users fetch error:', error);
      });

    eventsApi
      .getAll({ includeEventType: true })
      .then((response) => {
        if (response.success && response.data) {
          setEvents(
            response.data.map((event) => ({
              value: event.id,
              label: event.name,
              type: event.type?.name,
            })),
          );
        }
      })
      .catch((error) => {
        console.error('Events fetch error:', error);
      });
  }, []);

  const handleSubmit = async (data: z.infer<typeof competitorSchema>) => {
    startTransition(async () => {
      try {
        await competitorsApi.create({
          userId: data.userId,
          eventId: data.eventId,
          points: data.points,
          winner: data.winner,
        });
        router.push('/competitors');
      } catch (error) {
        console.error('Competitor creation error:', error);
        const rawMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        const userMessage =
          rawMessage.includes('405') || rawMessage.toLowerCase().includes('method not allowed')
            ? 'Yarışmacı oluşturma şu anda desteklenmiyor. Lütfen daha sonra tekrar deneyin.'
            : rawMessage;
        alert('Yarışmacı oluşturulurken hata oluştu: ' + userMessage);
      }
    });
  };

  // Filter events for leader
  const filteredEvents =
    currentUser && getLeaderEventType(currentUser)
      ? events.filter((e) => e.type === getLeaderEventType(currentUser))
      : events;

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Yarışmacı" description="Sisteme yeni yarışmacı ekleyin" />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form schema={competitorSchema} onSubmit={handleSubmit}>
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
                        <Select name="userId" label="Kullanıcı" options={users} required />
                        <Select name="eventId" label="Etkinlik" options={filteredEvents} required />
                        <TextField name="points" label="Puan" type="number" placeholder="100" />
                        <div className="flex items-end">
                          <Checkbox name="winner" label="Kazanan" />
                        </div>
                      </div>
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
