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
  let backendError = false;

  try {
    const [users, competitions, events, announcements] = await Promise.allSettled([
      getUsers(),
      getCompetitions(),
      getEvents(),
      getAnnouncements(),
    ]);

    if (users.status === 'fulfilled') usersCount = users.value.length;
    else if (users.reason?.message?.includes('502') || users.reason?.message?.includes('Backend servisi')) backendError = true;
    
    if (competitions.status === 'fulfilled') competitionsCount = competitions.value.length;
    else if (competitions.reason?.message?.includes('502') || competitions.reason?.message?.includes('Backend servisi')) backendError = true;
    
    if (events.status === 'fulfilled') eventsCount = events.value.length;
    else if (events.reason?.message?.includes('502') || events.reason?.message?.includes('Backend servisi')) backendError = true;
    
    if (announcements.status === 'fulfilled') announcementsCount = announcements.value.length;
    else if (announcements.reason?.message?.includes('502') || announcements.reason?.message?.includes('Backend servisi')) backendError = true;
  } catch (error) {
    console.error('Dashboard error:', error);
    if (error instanceof Error && (error.message.includes('502') || error.message.includes('Backend servisi'))) {
      backendError = true;
    }
  }

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {backendError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-yellow-800 font-semibold">Backend Servisi Erişilemiyor</p>
                <p className="text-yellow-700 text-sm">Backend servisi şu anda çalışmıyor veya erişilemiyor. Veriler yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
              </div>
            </div>
          </div>
        )}
        
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

