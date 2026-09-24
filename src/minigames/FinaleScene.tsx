import React, { useMemo } from 'react';
import type { GameState, ResumeData } from '../types';

interface Props {
  gameState: GameState;
  resumeData: ResumeData;
}

const getRank = (score: number): { rank: string; color: string } => {
  if (score >= 900) return { rank: 'S', color: 'text-yellow-400' };
  if (score >= 750) return { rank: 'A', color: 'text-purple-400' };
  if (score >= 550) return { rank: 'B', color: 'text-cyan-400' };
  return { rank: 'C', color: 'text-gray-400' };
};

const getAchievements = (gameState: GameState): string[] => {
  const achs: string[] = [];
  if (gameState.score >= 900) achs.push('🏆 Идеальное прохождение');
  if (gameState.score >= 700) achs.push('⭐ Senior Analyst');
  if (gameState.endTime && gameState.startTime && (gameState.endTime - gameState.startTime) < 480000) achs.push('⚡ Спидран');
  if ((gameState.sceneScores['antifraud'] || 0) >= 180) achs.push('🛡️ Антифрод-мастер');
  if ((gameState.sceneScores['integration'] || 0) >= 200) achs.push('🔌 API-гуру');
  if ((gameState.sceneScores['rollout'] || 0) >= 200) achs.push('🚀 Внедренец');
  return achs;
};

export const FinaleScene: React.FC<Props> = ({ gameState, resumeData }) => {
  const { rank, color } = useMemo(() => getRank(gameState.score), [gameState.score]);
  const achievements = useMemo(() => getAchievements(gameState), [gameState]);
  const timeSpent = gameState.endTime ? Math.round((gameState.endTime - gameState.startTime) / 1000) : 0;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const totals = resumeData.basics.totals;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900/95 rounded-2xl p-8 border border-cyan-500/30 max-w-2xl w-full mx-4 my-8 shadow-2xl">
        {/* Rank */}
        <div className="text-center mb-6">
          <div className={`text-8xl font-black ${color} mb-2`}>{rank}</div>
          <div className="text-gray-400 text-sm">Ранг</div>
        </div>

        {/* Score */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-white">{gameState.score} <span className="text-gray-500 text-xl">/ 1000</span></div>
          <div className="text-gray-500 text-sm mt-1">Время: {minutes}:{seconds.toString().padStart(2, '0')}</div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-400 text-sm mb-2 text-center">Достижения</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {achievements.map((ach, i) => (
                <span key={i} className="bg-gray-800/50 border border-yellow-500/30 rounded-full px-3 py-1 text-sm text-yellow-400">
                  {ach}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scene scores */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm mb-2 text-center">Результаты по сценам</h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(gameState.sceneScores).map(([scene, score]) => (
              <div key={scene} className="bg-gray-800/30 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500 truncate">{scene}</div>
                <div className="text-cyan-400 font-bold">{score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm mb-2 text-center">Ключевые метрики из резюме</h3>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-cyan-400">{totals.documents}+</div>
              <div className="text-xs text-gray-500">документов</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-purple-400">{totals.projects}</div>
              <div className="text-xs text-gray-500">проектов</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-green-400">{totals.budget} млн</div>
              <div className="text-xs text-gray-500">бюджет ₽</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-orange-400">{totals.users} млн</div>
              <div className="text-xs text-gray-500">пользователей</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-yellow-400">{totals.regions}</div>
              <div className="text-xs text-gray-500">регионов</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-white text-center font-medium mb-4">Связаться с Самедом</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {resumeData.basics.contacts.telegram && (
              <a href={resumeData.basics.contacts.telegram} target="_blank" rel="noopener noreferrer" className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 rounded-lg p-3 text-center text-blue-400 text-sm transition-colors">
                ✈️ Telegram
              </a>
            )}
            {resumeData.basics.contacts.hh && (
              <a href={resumeData.basics.contacts.hh} target="_blank" rel="noopener noreferrer" className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 rounded-lg p-3 text-center text-green-400 text-sm transition-colors">
                💼 hh.ru
              </a>
            )}
            {resumeData.basics.contacts.email && (
              <a href={`mailto:${resumeData.basics.contacts.email}`} className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-lg p-3 text-center text-purple-400 text-sm transition-colors">
                📧 Email
              </a>
            )}
            {resumeData.basics.contacts.phone && (
              <a href={`tel:${resumeData.basics.contacts.phone}`} className="bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/50 rounded-lg p-3 text-center text-orange-400 text-sm transition-colors">
                📞 Позвонить
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-xs">
          <p>{resumeData.basics.name} · {resumeData.basics.label}</p>
          <p className="mt-1">CareerForge: The System Architect's Journey</p>
        </div>
      </div>
    </div>
  );
};
