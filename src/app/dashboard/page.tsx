import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { getUsers } from '@/app/users/actions';
import { getCompetitions } from '@/app/competitions/actions';
import { getEvents } from '@/app/events/actions';
import { getAnnouncements } from '@/app/announcements/actions';
import { getSessions } from '@/app/sessions/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import type { AnnouncementDto, CompetitionDto, EventDto, SessionDto, UserDto } from '@/types/api';

const ROLE_PRIORITY = [
  'ADMIN',
  'SUPER_ADMIN',
  'USER_MANAGER',
  'YK',
  'DK',
  'AGC_ADMIN',
  'AGC_LEADER',
  'GECEKODU_ADMIN',
  'GECEKODU_LEADER',
  'BIZBIZE_ADMIN',
  'BIZBIZE_LEADER',
  'USER',
];

const getPrimaryRole = (roles: string[] = []) => {
  if (roles.length === 0) return 'Rol atanmamış';

  const getScore = (role: string) => {
    const index = ROLE_PRIORITY.indexOf(role);
    return index === -1 ? ROLE_PRIORITY.length : index;
  };

  return [...roles].sort((a, b) => {
    const diff = getScore(a) - getScore(b);
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  })[0];
};

export default async function DashboardPage() {
  let usersCount = 0;
  let competitionsCount = 0;
  let eventsCount = 0;
  let announcementsCount = 0;
  let sessionsCount = 0;
  let backendError = false;

  let usersList: UserDto[] = [];
  let announcementsList: AnnouncementDto[] = [];
  let sessionsList: SessionDto[] = [];

  try {
    const [users, competitions, events, announcements, sessions] = await Promise.allSettled([
      getUsers(),
      getCompetitions({ includeEventType: true }),
      getEvents({ includeEventType: true }),
      getAnnouncements({ includeUser: true }),
      getSessions({ includeEvent: true }),
    ]);

    if (users.status === 'fulfilled') {
      usersList = users.value;
      usersCount = users.value.length;
    } else if (
      users.reason?.message?.includes('502') ||
      users.reason?.message?.includes('Backend servisi')
    )
      backendError = true;

    if (competitions.status === 'fulfilled') {
      competitionsCount = competitions.value.length;
    } else if (
      competitions.reason?.message?.includes('502') ||
      competitions.reason?.message?.includes('Backend servisi')
    )
      backendError = true;

    if (events.status === 'fulfilled') {
      eventsCount = events.value.length;
    } else if (
      events.reason?.message?.includes('502') ||
      events.reason?.message?.includes('Backend servisi')
    )
      backendError = true;

    if (announcements.status === 'fulfilled') {
      announcementsList = announcements.value;
      announcementsCount = announcements.value.length;
    } else if (
      announcements.reason?.message?.includes('502') ||
      announcements.reason?.message?.includes('Backend servisi')
    )
      backendError = true;

    if (sessions.status === 'fulfilled') {
      sessionsList = sessions.value;
      sessionsCount = sessions.value.length;
    } else if (
      sessions.reason?.message?.includes('502') ||
      sessions.reason?.message?.includes('Backend servisi')
    )
      backendError = true;
  } catch (error) {
    console.error('Dashboard error:', error);
    if (
      error instanceof Error &&
      (error.message.includes('502') || error.message.includes('Backend servisi'))
    ) {
      backendError = true;
    }
  }

  const recentUsers = usersList.slice(0, 4);
  const upcomingSessions = [...sessionsList]
    .filter((session) => session.startTime)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);

  const latestAnnouncements = announcementsList.slice(0, 3);

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const statsCards = [
    {
      title: 'Toplam Kullanıcı',
      value: usersCount,
      href: '/users',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 6a4 4 0 110 8 4 4 0 010-8zm6 12v-1a4 4 0 00-4-4H10a4 4 0 00-4 4v1"
          />
        </svg>
      ),
    },
    {
      title: 'Yarışmalar',
      value: competitionsCount,
      href: '/competitions',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 3h6l1 7-4 2-4-2 1-7zm0 13l-3 5h12l-3-5"
          />
        </svg>
      ),
    },
    {
      title: 'Etkinlikler',
      value: eventsCount,
      href: '/events',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3M5 11h14M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"
          />
        </svg>
      ),
      displayClass: 'hidden sm:block',
    },
    {
      title: 'Duyurular',
      value: announcementsCount,
      href: '/announcements',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      displayClass: 'hidden md:block',
    },
    {
      title: 'Oturumlar',
      value: sessionsCount,
      href: '/sessions',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      displayClass: 'hidden lg:block',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Dashboard"
          description="Genel durumu, yaklaşan oturumları ve ekip aktivitelerini tek ekrandan takip edin"
        />

        {backendError && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">Backend Servisi Erişilemiyor</p>
                <p className="text-sm text-amber-700">
                  Backend servisi şu anda erişilemiyor. Kartlarda görülen veriler güncel
                  olmayabilir. Lütfen daha sonra tekrar deneyin.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
          {statsCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`border-dark-200 bg-light hover:border-brand/70 focus-visible:outline-brand min-w-[150px] flex-1 rounded-lg border p-4 transition hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-w-[180px] ${card.displayClass ?? ''}`}
            >
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <span className="text-dark-500 text-xs font-medium tracking-wide uppercase sm:text-sm sm:tracking-normal sm:normal-case">
                  {card.title}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-dark-900 text-xl font-semibold sm:text-2xl">
                    {card.value}
                  </span>
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1fr]">
          <div className="space-y-5">
            <section className="border-dark-200 bg-light rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-dark-900 text-lg font-semibold">Son Kullanıcılar</h2>
                  <p className="text-dark-500 text-sm">
                    Kullanıcılar ekranındaki en güncel kayıtlar
                  </p>
                </div>
                <Link
                  href="/users"
                  className="text-brand text-sm font-medium transition hover:opacity-80"
                >
                  Tümünü Gör
                </Link>
              </div>
              <div className="mt-4 space-y-2.5">
                {recentUsers.length === 0 ? (
                  <div className="border-dark-200/70 text-dark-500 rounded-lg border border-dashed p-5 text-center text-sm">
                    Henüz kullanıcı verisi bulunmuyor.
                  </div>
                ) : (
                  recentUsers.map((user) => {
                    const fullName =
                      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username;
                    const primaryRole = getPrimaryRole(user.roles || []);

                    return (
                      <Link
                        key={user.id}
                        href={`/users/${user.id}`}
                        className="hover:border-brand/60 hover:bg-brand-50/40 flex items-center gap-4 rounded-lg border border-transparent bg-white/60 p-3 transition"
                      >
                        <div className="bg-brand-100 text-brand-600 flex h-12 w-12 items-center justify-center rounded-full">
                          <span className="text-sm font-semibold">
                            {fullName ? fullName[0] : '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-dark-900 text-sm font-semibold">{fullName}</p>
                          <p className="text-dark-500 text-xs">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="border-brand-200 bg-brand-50 text-brand-600 rounded-full border px-3 py-1 text-xs font-medium">
                            {primaryRole}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            <section className="border-dark-200 bg-light rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-dark-900 text-lg font-semibold">Duyuru Panosu</h2>
                  <p className="text-dark-500 text-sm">Aktif duyuruların hızlı özetini inceleyin</p>
                </div>
                <Link
                  href="/announcements"
                  className="text-brand text-sm font-medium transition hover:opacity-80"
                >
                  Yönet
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {latestAnnouncements.length === 0 ? (
                  <div className="border-dark-200/70 text-dark-500 rounded-lg border border-dashed p-5 text-center text-sm">
                    Yayınlanmış duyuru bulunamadı.
                  </div>
                ) : (
                  latestAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border-dark-200 rounded-lg border bg-white/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-dark-900 text-sm font-semibold">
                            {announcement.title}
                          </p>
                          <p className="text-dark-500 line-clamp-1 text-xs">{announcement.body}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            announcement.active
                              ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                              : 'bg-dark-100 text-dark-500 border-dark-200 border'
                          }`}
                        >
                          {announcement.active ? 'Aktif' : 'Taslak'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="border-dark-200 bg-light rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-dark-900 text-lg font-semibold">Yaklaşan Oturumlar</h2>
                <p className="text-dark-500 text-sm">
                  Oturumlar sayfasındaki planlı etkinliklerden öne çıkanlar
                </p>
              </div>
              <Link
                href="/sessions"
                className="text-brand text-sm font-medium transition hover:opacity-80"
              >
                Oturumları Yönet
              </Link>
            </div>

            <div className="mt-5 space-y-2.5">
              {upcomingSessions.length === 0 ? (
                <div className="border-dark-200/70 text-dark-500 rounded-lg border border-dashed p-5 text-center text-sm">
                  Planlanmış oturum bulunmuyor.
                </div>
              ) : (
                upcomingSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}/edit`}
                    className="border-dark-200 hover:border-brand/60 hover:bg-brand-50/40 flex flex-col gap-2.5 rounded-lg border bg-white/60 p-3 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-dark-900 text-sm font-semibold">{session.title}</p>
                        <p className="text-dark-500 text-xs">
                          {session.speakerName ?? 'Konuşmacı belirlenmedi'}
                        </p>
                      </div>
                      {session.sessionType && (
                        <span className="border-dark-200/70 bg-dark-100 text-dark-600 rounded-full border px-3 py-1 text-[11px] font-medium">
                          {session.sessionType}
                        </span>
                      )}
                    </div>
                    <div className="text-dark-500 flex flex-wrap items-center gap-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <svg
                          className="text-brand h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatDateTime(session.startTime)}
                        {session.endTime && ` • ${formatDateTime(session.endTime)}`}
                      </div>
                      {session.event?.name && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="text-dark-400 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M3 9l9-7 9 7-9 7-9-7zm0 6l9 7 9-7"
                            />
                          </svg>
                          {session.event.name}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="border-dark-200 bg-light rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-dark-900 text-lg font-semibold">Hızlı İşlemler</h2>
              <p className="text-dark-500 text-sm">Sık kullanılan modüllere doğrudan erişin</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: '/users/new',
                title: 'Yeni Kullanıcı',
                description: 'Ekibinize yeni bir kişi ekleyin',
              },
              {
                href: '/events/new',
                title: 'Etkinlik Oluştur',
                description: 'Takviminizi güncel tutun',
              },
              {
                href: '/sessions/new',
                title: 'Oturum Planla',
                description: 'Etkinlik oturumlarını yönetin',
              },
              {
                href: '/announcements',
                title: 'Duyuruları Yönet',
                description: 'Toplulukla güncel kalın',
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="border-dark-200 hover:border-brand/60 hover:bg-brand-50/40 flex flex-col gap-1.5 rounded-lg border bg-white/60 p-3 transition"
              >
                <span className="text-dark-900 text-sm font-semibold">{action.title}</span>
                <span className="text-dark-500 text-xs">{action.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
