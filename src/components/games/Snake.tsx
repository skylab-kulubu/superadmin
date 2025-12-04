'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[5, 5]];
const INITIAL_DIRECTION = [1, 0];

export function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState([10, 10]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateFood = useCallback(() => {
    let newFood: number[];
    do {
      newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
    } while (snake.some((segment) => segment[0] === newFood[0] && segment[1] === newFood[1]));
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    generateFood();
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = [prevSnake[0][0] + direction[0], prevSnake[0][1] + direction[1]];

        // Check collisions
        if (
          newHead[0] < 0 ||
          newHead[0] >= GRID_SIZE ||
          newHead[1] < 0 ||
          newHead[1] >= GRID_SIZE ||
          prevSnake.some((segment) => segment[0] === newHead[0] && segment[1] === newHead[1])
        ) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => s + 1);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(moveSnake);
  }, [direction, food, gameOver, isPlaying, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction[1] !== 1) setDirection([0, -1]);
          break;
        case 'ArrowDown':
          if (direction[1] !== -1) setDirection([0, 1]);
          break;
        case 'ArrowLeft':
          if (direction[0] !== 1) setDirection([-1, 0]);
          break;
        case 'ArrowRight':
          if (direction[0] !== -1) setDirection([1, 0]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Yılan Oyunu</h3>
      <div className="text-brand text-lg font-semibold">Skor: {score}</div>

      <div
        className="bg-dark-100 border-dark-300 relative border-2"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {snake.map((segment, i) => (
          <div
            key={i}
            className="bg-brand absolute rounded-sm"
            style={{
              left: segment[0] * CELL_SIZE,
              top: segment[1] * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />
        ))}
        <div
          className="absolute rounded-full bg-red-500"
          style={{
            left: food[0] * CELL_SIZE,
            top: food[1] * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
          }}
        />

        {gameOver && (
          <div className="bg-dark/50 absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
            Oyun Bitti!
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!isPlaying && <Button onClick={resetGame}>{gameOver ? 'Tekrar Oyna' : 'Başla'}</Button>}
      </div>
      <p className="text-sm text-gray-500">Yön tuşları ile kontrol edin</p>
    </div>
  );
}
