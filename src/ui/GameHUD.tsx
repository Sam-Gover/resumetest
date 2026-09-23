import React from 'react';
import type { GameState, ResumeData } from '../types';

interface Props {
  gameState: GameState;
  resumeData: ResumeData;
  muted: boolean;
  onSkip: () => void;
  onToggleMute: () => void;
}

const sceneNames: Record<string, string> = {
  antifraud: 'Антифрод-система',
  mvp: 'MVP за 2 месяца',
  integration: 'API-интеграция',
  portfolio: 'Портфель проектов',
  rollout: 'Bitrix24 внедрение',
};

export const GameHUD: React.FC<Props> = ({ gameState, resumeData, muted, onSkip, onToggleMute }) => {
  const progress = (gameState.sceneIndex / gameState.totalScenes) * 100;
  const sceneName = gameState.currentScene ? sceneNames[gameState.currentScene] : '';

  return (
    <>
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{sceneName}</span>
              <span>{gameState.sceneIndex} / {gameState.totalScenes}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={onSkip} className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors">
            Пропустить →
          </button>
        </div>
      </div>

      {/* Score */}
      <div className="absolute top-16 right-4 z-40 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-cyan-500/20">
        <div className="text-xs text-gray-500">Очки</div>
        <div className="text-xl font-bold text-cyan-400">{gameState.score}</div>
      </div>

      {/* Mute button */}
      <button
        onClick={onToggleMute}
        className="absolute bottom-4 right-4 z-40 bg-black/60 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center border border-gray-700 hover:border-gray-500 transition-colors"
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  );
};
