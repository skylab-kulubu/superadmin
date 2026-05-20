'use client';

import React, { useMemo, useState, useEffect, use, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlinePencilSquare, HiOutlinePlus } from 'react-icons/hi2';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ModalDangerActions } from '@/components/ui/modal-actions';
import { Modal } from '@/components/ui/Modal';
import { eventsApi } from '@/lib/api/events';
import { eventDaysApi } from '@/lib/api/eventDays';
import { sessionsApi } from '@/lib/api/sessions';
import { competitorsApi } from '@/lib/api/competitors';
import { ticketsApi } from '@/lib/api/tickets';
import type { EventDto, SessionDto, CompetitorDto, GetTicketResponseDto } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import {
  canManageCompetitorsForEvent,
  canManageEventAudienceAdminViews,
  canOperateEventSchedulingOnEvent,
} from '@/lib/utils/permissions';

function competitorNumericSortValue(c: CompetitorDto): number {
  const v = c.score ?? c.points;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  return Number.NEGATIVE_INFINITY;
}

function competitorHasPoints(c: CompetitorDto): boolean {
  const v = c.score ?? c.points;
  return v !== undefined && v !== null && !(typeof v === 'number' && Number.isNaN(v));
}

function sortSessionsByStart(list: SessionDto[]) {
  return [...list].sort(
    (a, b) => new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime(),
  );
}

/** API genelde oturumda `event` doldurmaz; ilişki `eventDayId` üzerindedir. */
async function resolveSessionsForEvent(
  eventId: string,
  eventData: EventDto | undefined,
  allSessions: SessionDto[] | undefined,
): Promise<SessionDto[]> {
  if (!allSessions?.length) return [];

  if (eventData?.sessions && eventData.sessions.length > 0) {
    return sortSessionsByStart(eventData.sessions);
  }

  const withEventRef = allSessions.filter((s) => s.event?.id === eventId);
  if (withEventRef.length > 0) {
    return sortSessionsByStart(withEventRef);
  }

  const daysRes = await eventDaysApi.getByEventId(eventId);
  const dayIds = new Set(daysRes.success && daysRes.data ? daysRes.data.map((d) => d.id) : []);
  const byDay = allSessions.filter((s) => s.eventDayId && dayIds.has(s.eventDayId));
  return sortSessionsByStart(byDay);
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const showAudienceAdminSections = canManageEventAudienceAdminViews(user);

  const [event, setEvent] = useState<EventDto | null>(null);
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorDto[]>([]);
  const [tickets, setTickets] = useState<GetTicketResponseDto[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventDeleteOpen, setEventDeleteOpen] = useState(false);
  const [eventDeleting, setEventDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [eventRes, sessionsRes, competitorsRes, ticketsRes] = await Promise.all([
          eventsApi.getById(id),
          sessionsApi.getAll(),
          competitorsApi.getAll(),
          showAudienceAdminSections
            ? ticketsApi.getByEvent(id)
            : Promise.resolve({ success: true as const, data: [] }),
        ]);

        if (eventRes.success && eventRes.data) {
          setEvent(eventRes.data);
        } else {
          setError('Etkinlik bulunamadı');
        }

        const sessionList = sessionsRes.success ? sessionsRes.data : undefined;
        const resolved = await resolveSessionsForEvent(
          id,
          eventRes.success ? eventRes.data : undefined,
          sessionList,
        );
        setSessions(resolved);

        if (competitorsRes.success && competitorsRes.data) {
          setCompetitors(competitorsRes.data.filter((c) => c.event?.id === id));
        }

        if (ticketsRes.success && ticketsRes.data) {
          setTickets(ticketsRes.data);
        }
      } catch (err) {
        console.error('Veriler yüklenirken hata oluştu:', err);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showAudienceAdminSections]);

  const competitorsSortedByPoints = useMemo(
    () =>
      [...competitors].sort((a, b) => {
        const diff = competitorNumericSortValue(b) - competitorNumericSortValue(a);
        if (diff !== 0) return diff;
        const na = `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`;
        const nb = `${b.user?.firstName ?? ''} ${b.user?.lastName ?? ''}`;
        return na.localeCompare(nb, 'tr');
      }),
    [competitors],
  );

  const handleDeleteEvent = async () => {
    if (!event) return;
    if (!canOperateEventSchedulingOnEvent(user, event.type?.name)) {
      setEventDeleteOpen(false);
      return;
    }
    setEventDeleting(true);
    try {
      const res = await eventsApi.delete(id);
      if (res.success) {
        router.push('/events');
        return;
      }
      alert(res.message || 'Etkinlik silinemedi.');
    } catch {
      alert('Etkinlik silinirken hata oluştu.');
    } finally {
      setEventDeleting(false);
      setEventDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="text-dark-500 py-8 text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Etkinlik bulunamadı'}</p>
          <Button href="/events" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const canMutateSchedule = canOperateEventSchedulingOnEvent(user, event.type?.name);
  const canManageCompetitorsUi = canManageCompetitorsForEvent(user, event.type?.name);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlik Detayları"
        description={event.name}
        actions={
          <>
            <Button href="/events" variant="secondary">
              Geri Dön
            </Button>
            {canMutateSchedule ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setEventDeleteOpen(true)}
                className="whitespace-nowrap"
              >
                Etkinliği sil
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-6 lg:w-[70%]">
          {/* Etkinlik Detayları Kartı */}
          <div className="bg-light border-dark-200 overflow-hidden rounded-xl border shadow-sm">
            <div className="border-dark-200 bg-dark-50 flex items-center justify-between border-b p-4">
              <h2 className="text-dark-900 text-lg font-semibold">Genel Bilgiler</h2>
              {canMutateSchedule ? (
                <Button
                  href={`/events/${id}/edit`}
                  variant="secondary"
                  className="flex items-center gap-2 !px-3 !py-1.5 text-sm"
                >
                  <HiOutlinePencilSquare className="h-4 w-4" />
                  Düzenle
                </Button>
              ) : null}
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-dark-500 mb-1 block text-xs">Başlangıç Tarihi</span>
                  <span className="text-dark-900 text-sm font-medium">
                    {event.startDate ? new Date(event.startDate).toLocaleString('tr-TR') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-dark-500 mb-1 block text-xs">Bitiş Tarihi</span>
                  <span className="text-dark-900 text-sm font-medium">
                    {event.endDate ? new Date(event.endDate).toLocaleString('tr-TR') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-dark-500 mb-1 block text-xs">Konum</span>
                  <span className="text-dark-900 text-sm font-medium">{event.location || '-'}</span>
                </div>
                <div>
                  <span className="text-dark-500 mb-1 block text-xs">Etkinlik Tipi</span>
                  <span className="bg-brand-100 text-brand-800 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {event.type?.name || '-'}
                  </span>
                </div>
              </div>
              {event.description && (
                <div className="border-dark-100 border-t pt-4">
                  <span className="text-dark-500 mb-1 block text-xs">Açıklama</span>
                  <p className="text-dark-700 text-sm whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Oturumlar Kartı */}
          <div className="bg-light border-dark-200 overflow-hidden rounded-xl border shadow-sm">
            <div className="border-dark-200 bg-dark-50 flex items-center justify-between border-b p-4">
              <h2 className="text-dark-900 text-lg font-semibold">Oturumlar ({sessions.length})</h2>
              {canMutateSchedule ? (
                <div className="flex items-center gap-2">
                  <Button
                    href={`/events/${id}/days`}
                    variant="secondary"
                    className="!px-3 !py-1.5 text-sm"
                  >
                    Günleri Yönet
                  </Button>
                  <Button
                    href={`/sessions/new?eventId=${id}`}
                    className="flex items-center gap-2 !px-3 !py-1.5 text-sm"
                  >
                    <HiOutlinePlus className="h-4 w-4" />
                    Yeni Oturum
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="p-5">
              {sessions.length === 0 ? (
                <p className="text-dark-500 py-4 text-center text-sm">Henüz oturum eklenmemiş.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border-dark-200 bg-light-50 hover:bg-dark-50 flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-dark-900 text-sm font-medium">{session.title}</h3>
                        <p className="text-dark-500 mt-0.5 text-xs">
                          {session.startTime
                            ? new Date(session.startTime).toLocaleString('tr-TR')
                            : '-'}
                          {session.speakerName && ` • ${session.speakerName}`}
                        </p>
                        {session.speakerLinkedin ? (
                          <a
                            href={
                              session.speakerLinkedin.startsWith('http')
                                ? session.speakerLinkedin
                                : `https://${session.speakerLinkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand mt-1 inline-block text-xs underline"
                          >
                            LinkedIn profili
                          </a>
                        ) : null}
                      </div>
                      {canMutateSchedule ? (
                        <Button
                          href={`/sessions/${session.id}/edit?eventId=${id}`}
                          variant="secondary"
                          title="Oturumu düzenle"
                          aria-label="Oturumu düzenle"
                          className="border-dark-200 !inline-flex shrink-0 !items-center !gap-1.5 !px-3 !py-2 text-xs font-medium shadow-sm"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4 shrink-0" />
                          Düzenle
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[30%]">
          {/* Yarışmacılar Kartı */}
          <div className="bg-light border-dark-200 sticky top-6 overflow-hidden rounded-xl border shadow-sm">
            <div className="border-dark-200 bg-dark-50 flex items-center justify-between gap-2 border-b p-4">
              <h2 className="text-dark-900 text-lg font-semibold">
                Yarışmacılar ({competitors.length})
              </h2>
              {canManageCompetitorsUi ? (
                <Button
                  href={`/competitors/new?eventId=${id}`}
                  className="flex shrink-0 items-center gap-2 !px-3 !py-1.5 text-sm"
                >
                  <HiOutlinePlus className="h-4 w-4" />
                  Ekle
                </Button>
              ) : null}
            </div>
            <div className="max-h-[600px] overflow-y-auto p-5">
              {competitors.length === 0 ? (
                <p className="text-dark-500 py-4 text-center text-sm">Yarışmacı bulunmuyor.</p>
              ) : (
                <div className="space-y-3">
                  {competitorsSortedByPoints.map((competitor) => (
                    <div
                      key={competitor.id}
                      className={`border-dark-200 bg-light-50 flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors ${canManageCompetitorsUi ? 'hover:border-brand-300 justify-between' : ''}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-dark-900 truncate text-sm font-medium">
                          {competitor.user?.firstName} {competitor.user?.lastName}
                        </div>
                        <div
                          className="text-dark-500 truncate text-xs"
                          title={competitor.user?.email || ''}
                        >
                          {competitor.user?.email}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {competitorHasPoints(competitor) && (
                            <span className="bg-brand-50 text-brand-700 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium">
                              Puan: {competitor.score ?? competitor.points}
                            </span>
                          )}
                          {competitor.winner && (
                            <span className="bg-warning-100 text-warning-800 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium">
                              Kazanan
                            </span>
                          )}
                        </div>
                      </div>
                      {canManageCompetitorsUi ? (
                        <div className="flex shrink-0 items-center">
                          <Button
                            href={`/competitors/${competitor.id}/edit?eventId=${id}`}
                            variant="secondary"
                            className="border-dark-300 inline-flex cursor-pointer items-center justify-center !p-2 shadow-sm"
                            title="Düzenle"
                            aria-label="Yarışmacıyı düzenle"
                          >
                            <HiOutlinePencilSquare className="h-4 w-4 shrink-0" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAudienceAdminSections ? (
        <div className="bg-light border-dark-200 mt-6 overflow-hidden rounded-xl border shadow-sm">
          <div className="border-dark-200 bg-dark-50 flex items-center justify-between border-b p-4">
            <h2 className="text-dark-900 text-lg font-semibold">
              Katılımcılar / Biletler ({tickets.length})
            </h2>
          </div>
          <div className="overflow-x-auto p-0">
            {tickets.length === 0 ? (
              <p className="text-dark-500 py-6 text-center text-sm">Katılımcı bulunmuyor.</p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-dark-50 border-dark-200 text-dark-500 border-b text-xs uppercase">
                    <th className="p-4 font-medium">Bilet Tipi</th>
                    <th className="p-4 font-medium">Ad Soyad</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Okul/Bölüm</th>
                    <th className="p-4 font-medium">Bilet ID</th>
                  </tr>
                </thead>
                <tbody className="divide-dark-200 divide-y">
                  {tickets.map((ticket) => {
                    const isGuest = ticket.ticketType === 'GUEST';
                    const name = isGuest
                      ? `${ticket.guestFirstName || ''} ${ticket.guestLastName || ''}`
                      : `${ticket.owner?.firstName || ''} ${ticket.owner?.lastName || ''}`;
                    const email = isGuest ? ticket.guestEmail : ticket.owner?.email;
                    const school = isGuest
                      ? `${ticket.guestUniversity || ''} - ${ticket.guestDepartment || ''}`
                      : `${ticket.owner?.university || ''} - ${ticket.owner?.department || ''}`;
                    const isExpanded = expandedTicketId === ticket.id;

                    return (
                      <React.Fragment key={ticket.id}>
                        <tr
                          className="hover:bg-dark-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                        >
                          <td className="p-4 text-sm font-medium">
                            <span
                              className={`rounded px-2 py-1 text-xs ${isGuest ? 'bg-warning-100 text-warning-800' : 'bg-success-100 text-success-800'}`}
                            >
                              {isGuest ? 'Misafir' : 'Kayıtlı Üye'}
                            </span>
                          </td>
                          <td className="text-dark-900 p-4 text-sm">{name}</td>
                          <td className="text-dark-600 p-4 text-sm">{email}</td>
                          <td className="text-dark-600 p-4 text-sm">{school}</td>
                          <td className="text-dark-400 max-w-[120px] truncate p-4 font-mono text-xs">
                            {ticket.id}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-dark-50">
                            <td colSpan={5} className="p-6">
                              <div className="flex gap-6">
                                <div className="flex-1 space-y-3">
                                  <h4 className="text-dark-900 border-dark-200 border-b pb-2 text-sm font-semibold">
                                    Bilet Detayları
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-dark-500 mb-1 block text-xs">
                                        Telefon
                                      </span>
                                      <span className="text-dark-900">
                                        {isGuest
                                          ? ticket.guestPhoneNumber
                                          : ticket.owner?.phoneNumber || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-dark-500 mb-1 block text-xs">
                                        Sınıf / Derece
                                      </span>
                                      <span className="text-dark-900">
                                        {isGuest ? ticket.guestGrade : '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-dark-500 mb-1 block text-xs">
                                        Mail Gönderildi Mi?
                                      </span>
                                      <span className="text-dark-900">
                                        {ticket.sent ? 'Evet' : 'Hayır'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                  <h4 className="text-dark-900 border-dark-200 border-b pb-2 text-sm font-semibold">
                                    Check-in Geçmişi
                                  </h4>
                                  {ticket.checkIns && ticket.checkIns.length > 0 ? (
                                    <ul className="space-y-2">
                                      {ticket.checkIns.map((ci) => (
                                        <li
                                          key={ci.id}
                                          className="bg-light border-dark-200 flex justify-between rounded border p-2 text-xs"
                                        >
                                          <span className="text-dark-700">
                                            Gün ID: {ci.eventDayId || '-'}
                                          </span>
                                          <span className="text-dark-500">
                                            {ci.createdAt
                                              ? new Date(ci.createdAt).toLocaleString('tr-TR')
                                              : ''}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-dark-500 text-xs">
                                      Henüz check-in yapılmamış.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}

      {canMutateSchedule ? (
        <Modal
          isOpen={eventDeleteOpen}
          onClose={() => {
            if (!eventDeleting) setEventDeleteOpen(false);
          }}
          title="Etkinliği sil"
        >
          <p className="text-dark-700 text-sm">
            <strong>{event.name}</strong> etkinliğini silmek istediğinize emin misiniz? Bu işlem
            geri alınamaz.
          </p>
          <ModalDangerActions
            cancelLabel="Vazgeç"
            onCancel={() => setEventDeleteOpen(false)}
            onConfirm={handleDeleteEvent}
            isPending={eventDeleting}
            pendingLabel="Siliniyor…"
          />
        </Modal>
      ) : null}
    </div>
  );
}
