'use client';

import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { EventDto, UserDto } from '@/types/api';
import { eventsApi } from '@/lib/api/events';
import { eventTypesApi } from '@/lib/api/event-types';
import { EventsGridClient } from './EventsGridClient';
import { getLeaderEventType } from '@/lib/utils/permissions';

export default function EventsPage() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [eventTypeOrder, setEventTypeOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  useEffect(() => {
    // Fetch user first
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser({} as UserDto);
        }
      })
      .catch((err) => {
        console.error('User fetch error:', err);
        setCurrentUser({} as UserDto);
      });
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsResponse, eventTypesResponse] = await Promise.all([
        eventsApi.getAll({ includeEventType: true }),
        eventTypesApi.getAll(),
      ]);

      if (eventsResponse.success && eventsResponse.data) {
        let data = eventsResponse.data;

        // Filter for leaders based on event type
        if (currentUser?.roles?.length) {
          const leaderEventType = getLeaderEventType(currentUser);
          if (leaderEventType) {
            data = data.filter((e) => e.type?.name === leaderEventType);
          }
        }

        setEvents(data);
      } else {
        setError(eventsResponse.message || 'Etkinlikler yüklenirken hata oluştu');
      }

      if (eventTypesResponse.success && eventTypesResponse.data) {
        setEventTypeOrder(eventTypesResponse.data.map((type) => type.name));
      } else {
        setEventTypeOrder([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etkinlikler yüklenirken hata oluştu');
      console.error('Events page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser !== null) {
      loadEvents();
    }
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlikler"
        description="Tüm etkinlikleri görüntüleyin ve yönetin"
        actions={
          <Link href="/events/new">
            <Button>
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Yeni Etkinlik
              </span>
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="bg-light border-dark-200 text-dark-600 rounded-lg border p-6 text-center">
          Yükleniyor...
        </div>
      ) : error ? (
        <div className="bg-light border-danger text-danger rounded-lg border p-6">
          <p className="font-medium">Hata oluştu</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-light border-dark-200 text-dark-600 rounded-lg border p-6 text-center">
          Henüz etkinlik bulunmuyor.
        </div>
      ) : (
        <EventsGridClient events={events} eventTypeOrder={eventTypeOrder} />
      )}
    </div>
  );
}
