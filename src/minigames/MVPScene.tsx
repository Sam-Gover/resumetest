import React, { useState } from 'react';
import { audio } from '../audio/AudioManager';

interface Props {
  onComplete: (score: number, metrics: Record<string, any>) => void;
}

const QUESTIONS = [
  { q: 'С чего начнём MVP?', options: ['Собрать требования', 'Написать код', 'Нанять команду', 'Купить серверы'], correct: 0 },
  { q: 'Сколько ролей пользователей?', options: ['1', '2', '3', '5'], correct: 2 },
  { q: 'Как интегрировать Совкомбанк?', options: ['SOAP', 'REST API', 'FTP', 'Email'], correct: 1 },
  { q: 'Как ускорить разработку?', options: ['Больше разработчиков', 'AI-assisted + агенты', 'Работать ночью', 'Убрать тестирование'], correct: 1 },
  { q: 'Что покажем в backlog?', options: ['10 задач', '80 задач с приоритетами', 'Только баги', 'Ничего'], correct: 1 },
];

export const MVPScene: React.FC<Props> = ({ onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = QUESTIONS[currentQ];
    
    if (idx === q.correct) {
      audio.success();
      setCorrect(c => c + 1);
    } else {
      audio.error();
      setErrors(e => e + 1);
    }

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(q => q + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleFinish = () => {
    const score = Math.max(80, 200 - errors * 40);
    onComplete(score, { correct, errors });
  };

  if (showResult) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900/95 rounded-2xl p-8 border border-blue-500/30 max-w-md text-center">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">🚀 MVP запущен!</h2>
          <p className="text-gray-300 mb-2">Правильных ответов: {correct} / {QUESTIONS.length}</p>
          <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
            <p className="text-cyan-400 font-mono text-sm">2 месяца · 20 сценариев · 80 требований · API с банком</p>
          </div>
          <button onClick={handleFinish} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg">
            Далее →
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-2xl p-6 border border-blue-500/30 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-blue-400">💡 MVP за 2 месяца</h2>
          <span className="text-sm text-gray-500">{currentQ + 1} / {QUESTIONS.length}</span>
        </div>

        <p className="text-white text-lg mb-6">{q.q}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selected === null
                  ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50 hover:bg-gray-700/50'
                  : selected === i
                  ? i === q.correct
                    ? 'bg-green-600/30 border-green-500'
                    : 'bg-red-600/30 border-red-500 animate-pulse'
                  : i === q.correct
                  ? 'bg-green-600/20 border-green-500/50'
                  : 'bg-gray-800/30 border-gray-700 opacity-50'
              }`}
            >
              <span className="text-white">{opt}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-1 mt-4">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i < currentQ ? 'bg-blue-500' : i === currentQ ? 'bg-blue-400 animate-pulse' : 'bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
