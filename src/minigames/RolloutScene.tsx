import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../audio/AudioManager';

interface Props {
  onComplete: (score: number, metrics: Record<string, any>) => void;
}

const REGIONS = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Самара', 'Пермь', 'Воронеж', 'Волгоград',
];

const DURATION = 45;

export const RolloutScene: React.FC<Props> = ({ onComplete }) => {
  const [trained, setTrained] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowResult(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleTrain = (idx: number) => {
    if (trained.has(idx)) return;
    audio.tick();
    setTrained(prev => new Set([...prev, idx]));
  };

  const handleFinish = () => {
    const count = trained.size;
    const score = Math.round(200 * (count / 10));
    const speedUp = count === 10 ? 30 : count >= 6 ? 20 : 10;
    onComplete(score, { regions: count, speedUp });
  };

  if (showResult) {
    const count = trained.size;
    const speedUp = count === 10 ? 30 : count >= 6 ? 20 : 10;
    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900/95 rounded-2xl p-8 border border-green-500/30 max-w-md text-center">
          <h2 className="text-2xl font-bold text-green-400 mb-4">🚀 Bitrix24 внедрён</h2>
          <p className="text-gray-300 mb-2">Обучено регионов: {count} / 10</p>
          <p className="text-cyan-400 font-bold text-xl">+{speedUp}% скорость процессов</p>
          <p className="text-gray-500 text-sm mt-2">190 пользователей во всех 89 регионах</p>
          {count === 10 && <p className="text-yellow-400 mt-2">🏆 Ачивка: Внедренец!</p>}
          <button onClick={handleFinish} className="mt-6 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg">
            Далее →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-2xl p-6 border border-green-500/30 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-400">🚀 Обучение Bitrix24</h2>
          <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}с
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4">Кликайте по регионам для обучения команд</p>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {REGIONS.map((region, idx) => (
            <button
              key={idx}
              onClick={() => handleTrain(idx)}
              className={`p-3 rounded-lg text-xs font-medium transition-all ${
                trained.has(idx)
                  ? 'bg-green-600/30 border border-green-500/50 text-green-400'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-green-500/50 text-gray-400 hover:text-white'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="text-center">
          <span className="text-gray-500 text-sm">Обучено: </span>
          <span className="text-cyan-400 font-bold">{trained.size} / 10</span>
        </div>

        <div className="w-full h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all" style={{ width: `${(trained.size / 10) * 100}%` }} />
        </div>
      </div>
    </div>
  );
};
