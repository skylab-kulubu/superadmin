'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CompetitorDto } from '@/types/api';
import { Button } from '@/components/ui/Button';

interface CompetitorsGridClientProps {
  competitorsByEvent: Record<string, CompetitorDto[]>;
}

export function CompetitorsGridClient({ competitorsByEvent }: CompetitorsGridClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Etkinlik isimlerinı (grupları) al ve sırala
  const eventNames = useMemo(() => Object.keys(competitorsByEvent).sort(), [competitorsByEvent]);

  // Arama fonksiyonu
  const filterCompetitors = (competitors: CompetitorDto[]): CompetitorDto[] => {
    if (!searchQuery.trim()) return competitors;

    const query = searchQuery.toLowerCase().trim();
    return competitors.filter((competitor) => {
      const user = competitor.user;
      if (!user) return false;

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || username.includes(query);
    });
  };

  // Filtrelenmiş ve boş olmayan grupları hesapla
  const filteredGroups = useMemo(() => {
    const groups: { name: string; items: CompetitorDto[] }[] = [];

    eventNames.forEach((eventName) => {
      const filtered = filterCompetitors(competitorsByEvent[eventName] || []);
      // Eğer arama yapılıyorsa sadece eşleşen sonuçları olan grupları göster
      // Arama yoksa veya grupta hiç veri yoksa bile başlığı göstermek isteyebiliriz ama
      // genelde boş sütun göstermek anlamsız olabilir.
      // Kullanıcı sayfasında boş sütunlar gösteriliyordu ("Kullanıcı yok" diyerek).
      // Burada da aynısını yapalım.
      groups.push({ name: eventName, items: filtered });
    });

    return groups;
  }, [competitorsByEvent, eventNames, searchQuery]);

  const renderColumn = (group: { name: string; items: CompetitorDto[] }) => (
    <div key={group.name} className="space-y-2">
      <div>
        <h2 className="text-dark-900 mb-1 truncate text-sm font-semibold" title={group.name}>
          {group.name}
        </h2>
        <div className="border-dark-200 border-b"></div>
      </div>
      <div className="space-y-1.5">
        {group.items.length === 0 ? (
          <p className="text-dark-400 text-xs">Yarışmacı yok</p>
        ) : (
          group.items.map((competitor) => (
            <div
              key={competitor.id}
              className={`bg-light hover:bg-brand-50 hover:border-brand group relative min-w-0 rounded-md border px-2 py-1.5 transition-all ${
                competitor.winner ? 'border-brand-300 bg-brand-50/30' : 'border-dark-200'
              }`}
            >
              <Link href={`/competitors/${competitor.id}/edit`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-dark-900 truncate text-xs font-medium">
                      {competitor.user?.firstName} {competitor.user?.lastName}
                    </div>
                    <div
                      className="text-dark-500 mt-0.5 truncate text-[10px]"
                      title={competitor.user?.email || ''}
                    >
                      {competitor.user?.email}
                    </div>
                  </div>
                  {competitor.score ? (
                    <span className="bg-brand-100 text-brand-700 rounded px-1 text-[10px] font-semibold">
                      {competitor.score}p
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Arama Kutusu */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Yarışmacı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-4 py-2 pl-10 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
          />
          <svg
            className="text-dark-400 absolute top-2.5 left-3 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-dark-400 hover:text-dark-600 absolute top-2.5 right-3"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredGroups.map(renderColumn)}
      </div>
    </div>
  );
}
