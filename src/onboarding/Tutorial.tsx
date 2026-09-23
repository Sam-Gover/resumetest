import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export const Tutorial: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const tips = [
    '🎮 Вы пройдёте 5 интерактивных сцен из реального опыта',
    '📊 Каждая сцена — конкретный навык и метрика',
    '⏭️ Кнопка «Пропустить» доступна всегда',
  ];

  useEffect(() => {
    if (step < tips.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 2500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-black/70 backdrop-blur-md rounded-2xl px-8 py-6 border border-cyan-500/30 max-w-md text-center">
        <p className="text-white text-lg">{tips[step]}</p>
        <div className="flex gap-2 justify-center mt-4">
          {tips.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-cyan-400' : 'bg-gray-600'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
