'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export function MinesweeperGame() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const initializeGrid = () => {
    const newGrid: Cell[][] = Array(ROWS)
      .fill(null)
      .map(() =>
        Array(COLS)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          })),
      );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < ROWS && c + j >= 0 && c + j < COLS) {
                if (newGrid[r + i][c + j].isMine) count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWin(false);
    setIsPlaying(true);
  };

  const revealCell = (r: number, c: number) => {
    if (gameOver || win || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    const newGrid = [...grid.map((row) => [...row])];

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid[r][c].isRevealed = true;
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    const reveal = (row: number, col: number) => {
      if (
        row < 0 ||
        row >= ROWS ||
        col < 0 ||
        col >= COLS ||
        newGrid[row][col].isRevealed ||
        newGrid[row][col].isFlagged
      )
        return;

      newGrid[row][col].isRevealed = true;

      if (newGrid[row][col].neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            reveal(row + i, col + j);
          }
        }
      }
    };

    reveal(r, c);
    setGrid(newGrid);

    // Check win
    const unrevealedSafeCells = newGrid
      .flat()
      .filter((cell) => !cell.isMine && !cell.isRevealed).length;
    if (unrevealedSafeCells === 0) {
      setWin(true);
      setGameOver(true);
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || win || grid[r][c].isRevealed) return;

    const newGrid = [...grid.map((row) => [...row])];
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Mayın Tarlası</h3>

      <div
        className="bg-dark-200 grid gap-1 rounded p-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, 30px)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-sm text-sm font-bold select-none ${
                cell.isRevealed
                  ? cell.isMine
                    ? 'bg-red-500'
                    : 'bg-gray-200'
                  : 'bg-brand hover:bg-brand-600'
              } `}
              onClick={() => revealCell(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
            >
              {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && cell.neighborMines}
              {cell.isRevealed && cell.isMine && '💣'}
              {!cell.isRevealed && cell.isFlagged && '🚩'}
            </div>
          )),
        )}
      </div>

      {(gameOver || win) && (
        <div className={`text-xl font-bold ${win ? 'text-green-600' : 'text-red-600'}`}>
          {win ? 'Kazandın!' : 'Kaybettin!'}
        </div>
      )}

      <Button onClick={initializeGrid}>{isPlaying ? 'Yeniden Başlat' : 'Başla'}</Button>
      <p className="text-sm text-gray-500">Sol tık: Aç, Sağ tık: Bayrak</p>
    </div>
  );
}
