'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Select } from '@/components/forms/Select';
import { Checkbox } from '@/components/forms/Checkbox';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { competitorsApi } from '@/lib/api/competitors';
import { usersApi } from '@/lib/api/users';
import { eventsApi } from '@/lib/api/events';

const competitorSchema = z.object({
  userId: z.string().min(1, 'Kullanıcı seçiniz'),
  eventId: z.string().min(1, 'Etkinlik seçiniz'),
  points: z.string().optional().transform((val) => val === '' ? undefined : (val ? parseFloat(val) : undefined)),
  winner: z.boolean().optional(),
});

export default function NewCompetitorPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [events, setEvents] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    usersApi.getAll().then((response) => {
      if (response.success && response.data) {
        setUsers(response.data.map((user) => ({ 
          value: user.id, 
          label: `${user.firstName} ${user.lastName} (${user.email})` 
        })));
      }
    }).catch((error) => {
      console.error('Users fetch error:', error);
    });

    eventsApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEvents(response.data.map((event) => ({ 
          value: event.id, 
          label: event.name 
        })));
      }
    }).catch((error) => {
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
        const userMessage = rawMessage.includes('405') || rawMessage.toLowerCase().includes('method not allowed')
          ? 'Yarışmacı oluşturma şu anda desteklenmiyor. Lütfen daha sonra tekrar deneyin.'
          : rawMessage;
        alert('Yarışmacı oluşturulurken hata oluştu: ' + userMessage);
      }
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Yarışmacı</h1>
        <Form schema={competitorSchema} onSubmit={handleSubmit}>
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
                  <TextField name="points" label="Puan" type="number" />
                  <Checkbox name="winner" label="Kazanan" />
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
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
    </AppShell>
  );
}

