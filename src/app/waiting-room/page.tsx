'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { SnakeGame } from '@/components/games/Snake';
import { MinesweeperGame } from '@/components/games/Minesweeper';
import { MemoryGame } from '@/components/games/Memory';

type GameType = 'snake' | 'minesweeper' | 'memory' | null;

export default function WaitingRoomPage() {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-brand text-3xl font-bold">Bekleme Salonu</h1>
          <p className="text-dark-600 text-lg">
            Hesabınız henüz yetkilendirilmemiştir. Yönetici onayı beklerken oyun oynayarak vakit
            geçirebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => setActiveGame('snake')}
            className={`rounded-xl border-2 p-6 transition-all hover:scale-105 ${
              activeGame === 'snake'
                ? 'border-brand bg-brand-50'
                : 'border-dark-200 hover:border-brand-200 bg-white'
            }`}
          >
            <div className="mb-2 text-4xl">🐍</div>
            <h3 className="text-dark text-xl font-bold">Yılan</h3>
            <p className="text-dark-500 text-sm">Klasik yılan oyunu</p>
          </button>

          <button
            onClick={() => setActiveGame('minesweeper')}
            className={`rounded-xl border-2 p-6 transition-all hover:scale-105 ${
              activeGame === 'minesweeper'
                ? 'border-brand bg-brand-50'
                : 'border-dark-200 hover:border-brand-200 bg-white'
            }`}
          >
            <div className="mb-2 text-4xl">💣</div>
            <h3 className="text-dark text-xl font-bold">Mayın Tarlası</h3>
            <p className="text-dark-500 text-sm">Dikkatli bas!</p>
          </button>

          <button
            onClick={() => setActiveGame('memory')}
            className={`rounded-xl border-2 p-6 transition-all hover:scale-105 ${
              activeGame === 'memory'
                ? 'border-brand bg-brand-50'
                : 'border-dark-200 hover:border-brand-200 bg-white'
            }`}
          >
            <div className="mb-2 text-4xl">🎴</div>
            <h3 className="text-dark text-xl font-bold">Hafıza</h3>
            <p className="text-dark-500 text-sm">Eşleri bul</p>
          </button>
        </div>

        <div className="flex min-h-[400px] justify-center">
          {activeGame === 'snake' && <SnakeGame />}
          {activeGame === 'minesweeper' && <MinesweeperGame />}
          {activeGame === 'memory' && <MemoryGame />}
          {!activeGame && (
            <div className="text-dark-400 flex items-center justify-center italic">
              Oynamak için bir oyun seçin
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
