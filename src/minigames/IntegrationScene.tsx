import React, { useState } from 'react';
import { audio } from '../audio/AudioManager';

interface Props {
  onComplete: (score: number, metrics: Record<string, any>) => void;
}

const NODES = [
  { id: 'client', label: 'Client', desc: 'Запрос от пользователя', order: 0 },
  { id: 'auth', label: 'Auth', desc: 'OAuth-токен и подпись', order: 1 },
  { id: 'gateway', label: 'Gateway', desc: 'Валидация и маршрутизация', order: 2 },
  { id: 'response', label: 'Response', desc: 'Обработка и ответ 200 OK', order: 3 },
];

export const IntegrationScene: React.FC<Props> = ({ onComplete }) => {
  const [placed, setPlaced] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleNodeClick = (nodeId: string) => {
    if (placed.includes(nodeId)) return;
    const node = NODES.find(n => n.id === nodeId)!;
    const expectedOrder = placed.length;

    if (node.order === expectedOrder) {
      audio.success();
      const newPlaced = [...placed, nodeId];
      setPlaced(newPlaced);
      if (newPlaced.length === NODES.length) {
        setTimeout(() => setShowResult(true), 500);
      }
    } else {
      audio.error();
      setErrors(e => e + 1);
    }
  };

  const handleFinish = () => {
    let score = 200;
    if (errors === 0) score = 200;
    else if (errors <= 2) score = 150;
    else score = 100;
    onComplete(score, { errors });
  };

  if (showResult) {
    const quality = errors === 0 ? 'идеально' : errors <= 2 ? 'чисто' : 'с доработками';
    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900/95 rounded-2xl p-8 border border-orange-500/30 max-w-md text-center">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">🔌 API-интеграция настроена</h2>
          <p className="text-gray-300 mb-2">Ошибок: {errors}</p>
          <p className="text-cyan-400 font-medium">Качество: {quality}</p>
          <p className="text-gray-500 text-sm mt-2">Интеграция с Совкомбанком</p>
          <button onClick={handleFinish} className="mt-6 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg">
            Далее →
          </button>
        </div>
      </div>
    );
  }

  const availableNodes = NODES.filter(n => !placed.includes(n.id));

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-2xl p-6 border border-orange-500/30 max-w-lg w-full mx-4">
        <h2 className="text-lg font-bold text-orange-400 mb-4">🌐 Постройте цепочку REST API</h2>
        <p className="text-gray-400 text-sm mb-4">Кликайте узлы в правильном порядке</p>

        {/* Chain */}
        <div className="flex gap-2 mb-6 min-h-[60px]">
          {NODES.map((_, i) => {
            const placedNode = placed[i] ? NODES.find(n => n.id === placed[i]) : null;
            return (
              <div key={i} className={`flex-1 rounded-lg p-2 text-center text-xs border ${placedNode ? 'bg-green-600/20 border-green-500/50 text-green-400' : 'bg-gray-800/30 border-gray-700 border-dashed text-gray-600'}`}>
                {placedNode ? placedNode.label : `${i + 1}`}
              </div>
            );
          })}
        </div>

        {/* Available nodes */}
        <div className="grid grid-cols-2 gap-3">
          {availableNodes.map(node => (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-orange-500/50 rounded-lg p-3 text-left transition-all"
            >
              <div className="text-white font-medium">{node.label}</div>
              <div className="text-gray-500 text-xs mt-1">{node.desc}</div>
            </button>
          ))}
        </div>

        {errors > 0 && <p className="text-red-400 text-sm mt-3 text-center">Ошибок: {errors}</p>}
      </div>
    </div>
  );
};
