import React, { useState } from 'react';
import { audio } from '../audio/AudioManager';

interface Props {
  onComplete: (score: number, metrics: Record<string, any>) => void;
}

const GOOD_REGIONS = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Самара', 'Пермь'];
const BAD_REGIONS = ['Unknown', 'Test-region', '?', 'N/A', '—'];

interface Application {
  id: number;
  region: string;
  inn: string;
  amount: string;
  isFraud: boolean;
}

const generateApplications = (): Application[] => {
  const apps: Application[] = [];
  const usedInns = new Set<string>();
  
  for (let i = 0; i < 12; i++) {
    const isBadRegion = Math.random() > 0.6;
    const region = isBadRegion ? BAD_REGIONS[Math.floor(Math.random() * BAD_REGIONS.length)] : GOOD_REGIONS[Math.floor(Math.random() * GOOD_REGIONS.length)];
    
    let inn = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const isDuplicate = Math.random() > 0.8 && usedInns.size > 0;
    if (isDuplicate) {
      inn = Array.from(usedInns)[Math.floor(Math.random() * usedInns.size)];
    } else {
      usedInns.add(inn);
    }
    
    const amount = (Math.floor(Math.random() * 500) + 100).toString() + ' тыс ₽';
    const isFraud = isBadRegion || isDuplicate;
    
    apps.push({ id: i, region, inn, amount, isFraud });
  }
  return apps;
};

export const AntifraudScene: React.FC<Props> = ({ onComplete }) => {
  const [applications] = useState(generateApplications);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<Array<{ app: Application; accepted: boolean; wasCorrect: boolean }>>([]);
  const [showResult, setShowResult] = useState(false);

  const handleDecision = (accepted: boolean) => {
    const app = applications[currentIndex];
    const wasCorrect = accepted !== app.isFraud;
    
    if (wasCorrect) {
      audio.success();
      setCorrect(c => c + 1);
    } else {
      audio.error();
    }
    
    setResults(r => [...r, { app, accepted, wasCorrect }]);
    
    if (currentIndex < applications.length - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 500);
    } else {
      setTimeout(() => setShowResult(true), 500);
    }
  };

  const handleFinish = () => {
    const accuracy = correct / applications.length;
    const score = Math.round(200 * accuracy);
    const reduction = Math.round(20 + 20 * accuracy);
    onComplete(score, { accuracy, reduction });
  };

  if (showResult) {
    const accuracy = correct / applications.length;
    const reduction = Math.round(20 + 20 * accuracy);
    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900/95 rounded-2xl p-8 border border-green-500/30 max-w-md text-center">
          <h2 className="text-2xl font-bold text-green-400 mb-4">✅ Антифрод-система внедрена</h2>
          <p className="text-gray-300 mb-2">Правильных решений: {correct} / {applications.length}</p>
          <p className="text-3xl font-bold text-cyan-400 mb-2">−{reduction}% заявок</p>
          <p className="text-gray-500 text-sm">Поток низкокачественных заявок снижен</p>
          <button onClick={handleFinish} className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg">
            Далее →
          </button>
        </div>
      </div>
    );
  }

  const app = applications[currentIndex];
  const lastResult = results[results.length - 1];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-2xl p-6 border border-cyan-500/30 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-cyan-400">🛡️ Антифрод: проверка заявок</h2>
          <span className="text-sm text-gray-500">{currentIndex + 1} / {applications.length}</span>
        </div>
        <p className="text-gray-400 text-sm mb-4">Отклоните фрод-заявки (некорректный регион или дубликат ИНН)</p>
        
        {app && (
          <div className={`bg-gray-800/50 rounded-xl p-4 mb-4 border ${lastResult && currentIndex === results.length ? (lastResult.wasCorrect ? 'border-green-500/50' : 'border-red-500/50') : 'border-gray-700'}`}>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs">Регион</div>
                <div className={`font-medium ${BAD_REGIONS.includes(app.region) ? 'text-red-400' : 'text-white'}`}>{app.region}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">ИНН</div>
                <div className="text-white font-mono text-xs">{app.inn}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Сумма</div>
                <div className="text-white">{app.amount}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => handleDecision(false)} className="flex-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 py-3 rounded-lg font-medium transition-colors">
            ✕ Отклонить
          </button>
          <button onClick={() => handleDecision(true)} className="flex-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 py-3 rounded-lg font-medium transition-colors">
            ✓ Принять
          </button>
        </div>

        <div className="flex gap-1 mt-4">
          {applications.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i < currentIndex ? 'bg-cyan-500' : i === currentIndex ? 'bg-cyan-400 animate-pulse' : 'bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
