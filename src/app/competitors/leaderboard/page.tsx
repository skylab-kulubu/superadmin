'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { competitorsApi } from '@/lib/api/competitors';
import { eventTypesApi } from '@/lib/api/event-types';
import { seasonsApi } from '@/lib/api/seasons';
import type { LeaderboardDto } from '@/types/api';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [seasons, setSeasons] = useState<{ value: string; label: string }[]>([]);

  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  useEffect(() => {
    // Load filters
    Promise.all([eventTypesApi.getAll(), seasonsApi.getAll()]).then(([etRes, seasonRes]) => {
      if (etRes.success && etRes.data) {
        setEventTypes(etRes.data.map((et) => ({ value: et.name, label: et.name })));
        if (etRes.data.length > 0) setSelectedEventType(etRes.data[0].name);
      }
      if (seasonRes.success && seasonRes.data) {
        setSeasons(seasonRes.data.map((s) => ({ value: s.id, label: s.name })));
      }
    });
  }, []);

  const loadLeaderboard = async () => {
    if (!selectedEventType) return;
    setLoading(true);
    try {
      let response;
      if (selectedSeason) {
        response = await competitorsApi.getSeasonLeaderboard(selectedSeason, selectedEventType);
      } else {
        response = await competitorsApi.getLeaderboard(selectedEventType);
      }

      if (response.success && response.data) {
        setLeaderboard(response.data);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventType) {
      loadLeaderboard();
    }
  }, [selectedEventType, selectedSeason]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Liderlik Tablosu"
        description="Etkinlik türü ve sezona göre puan durumu"
        actions={
          <Button onClick={loadLeaderboard} disabled={loading || !selectedEventType}>
            Yenile
          </Button>
        }
      />

      <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-dark-800 block text-sm font-medium">Etkinlik Tipi</label>
            <select
              className="bg-light border-dark-200 focus:ring-brand text-dark w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
            >
              {eventTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-dark-800 block text-sm font-medium">Sezon (İsteğe bağlı)</label>
            <select
              className="bg-light border-dark-200 focus:ring-brand text-dark w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option value="">Tümü</option>
              {seasons.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="text-dark-600 w-full text-left text-sm">
            <thead className="bg-light-50 text-dark-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Sıra</th>
                <th className="px-6 py-3">Kullanıcı</th>
                <th className="px-6 py-3">Etkinlik Sayısı</th>
                <th className="px-6 py-3 text-right">Toplam Puan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    Yükleniyor...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    Veri bulunamadı.
                  </td>
                </tr>
              ) : (
                leaderboard.map((item, index) => (
                  <tr
                    key={item.user?.id || index}
                    className="border-dark-100 hover:bg-light-50 border-b"
                  >
                    <td className="px-6 py-4 font-medium">{item.rank}</td>
                    <td className="px-6 py-4">
                      {item.user
                        ? `${item.user.firstName} ${item.user.lastName}`
                        : 'Silinmiş Kullanıcı'}
                      <div className="text-dark-400 text-xs">{item.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">{item.eventCount}</td>
                    <td className="text-brand-600 px-6 py-4 text-right font-bold">
                      {item.totalScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
