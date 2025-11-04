import { AppShell } from '@/components/layout/AppShell';
import { getUsers } from '@/app/users/actions';
import { getCompetitions } from '@/app/competitions/actions';
import { getEvents } from '@/app/events/actions';
import { getAnnouncements } from '@/app/announcements/actions';

export default async function DashboardPage() {
  let usersCount = 0;
  let competitionsCount = 0;
  let eventsCount = 0;
  let announcementsCount = 0;

  try {
    const [users, competitions, events, announcements] = await Promise.allSettled([
      getUsers(),
      getCompetitions(),
      getEvents(),
      getAnnouncements(),
    ]);

    if (users.status === 'fulfilled') usersCount = users.value.length;
    if (competitions.status === 'fulfilled') competitionsCount = competitions.value.length;
    if (events.status === 'fulfilled') eventsCount = events.value.length;
    if (announcements.status === 'fulfilled') announcementsCount = announcements.value.length;
  } catch (error) {
    console.error('Dashboard error:', error);
  }

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Kullanıcılar</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{usersCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Yarışmalar</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{competitionsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Etkinlikler</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{eventsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Duyurular</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{announcementsCount}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

