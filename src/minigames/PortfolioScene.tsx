import React, { useState } from 'react';
import { audio } from '../audio/AudioManager';

interface Props {
  onComplete: (score: number, metrics: Record<string, any>) => void;
}

interface Project {
  id: number;
  name: string;
  budget: number;
}

const PROJECTS: Project[] = [
  { id: 1, name: 'Проект А', budget: 2 },
  { id: 2, name: 'Проект Б', budget: 3 },
  { id: 3, name: 'Проект В', budget: 1 },
  { id: 4, name: 'Проект Г', budget: 4 },
  { id: 5, name: 'Проект Д', budget: 2 },
  { id: 6, name: 'Проект Е', budget: 1 },
  { id: 7, name: 'Проект Ж', budget: 3 },
  { id: 8, name: 'Проект З', budget: 2 },
  { id: 9, name: 'Проект И', budget: 1 },
];

const TEAMS = ['Команда 1', 'Команда 2', 'Команда 3'];
const MAX_BUDGET = 6;

export const PortfolioScene: React.FC<Props> = ({ onComplete }) => {
  const [assignments, setAssignments] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAssign = (projectId: number, teamIdx: number) => {
    audio.click();
    setAssignments(prev => ({ ...prev, [projectId]: teamIdx }));
  };

  const teamBudgets = TEAMS.map((_, idx) => {
    return Object.entries(assignments)
      .filter(([_, teamIdx]) => Number(teamIdx) === idx)
      .reduce((sum, [projId]) => sum + (PROJECTS.find(p => p.id === Number(projId))?.budget || 0), 0);
  });

  const allAssigned = Object.keys(assignments).length === PROJECTS.length;
  const withinLimits = teamBudgets.every(b => b <= MAX_BUDGET);
  const totalBudget = PROJECTS.reduce((sum, p) => sum + p.budget, 0);
  const maxUsed = Math.max(...teamBudgets);
  const savings = Math.max(0, totalBudget * 2 - maxUsed * 2); // Упрощённая формула

  const handleCheck = () => {
    if (!allAssigned || !withinLimits) return;
    setShowResult(true);
  };

  const handleFinish = () => {
    const efficiency = withinLimits ? 1 : 0.5;
    const score = Math.round(200 * efficiency);
    onComplete(score, { savings: savings.toFixed(1), teamBudgets });
  };

  if (showResult) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900/95 rounded-2xl p-8 border border-purple-500/30 max-w-md text-center">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">📊 Портфель оптимизирован</h2>
          <p className="text-gray-300 mb-2">9 проектов · 16 млн ₽</p>
          <p className="text-cyan-400 font-bold text-xl">Экономия ~{savings.toFixed(1)} млн ₽</p>
          <p className="text-gray-500 text-sm mt-2">70 региональных команд скоординированы</p>
          <button onClick={handleFinish} className="mt-6 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg">
            Далее →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-2xl p-6 border border-purple-500/30 max-w-2xl w-full mx-4">
        <h2 className="text-lg font-bold text-purple-400 mb-2">🚀 Распределите 9 проектов</h2>
        <p className="text-gray-400 text-sm mb-4">Лимит: {MAX_BUDGET} млн ₽ на команду. Бюджет: {totalBudget} млн ₽</p>

        {/* Teams */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {TEAMS.map((team, idx) => (
            <div key={idx} className={`rounded-lg p-3 border ${teamBudgets[idx] > MAX_BUDGET ? 'bg-red-900/30 border-red-500/50' : 'bg-gray-800/50 border-gray-700'}`}>
              <div className="text-white font-medium text-sm mb-1">{team}</div>
              <div className={`text-lg font-bold ${teamBudgets[idx] > MAX_BUDGET ? 'text-red-400' : 'text-cyan-400'}`}>
                {teamBudgets[idx]} / {MAX_BUDGET} млн ₽
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="grid grid-cols-3 gap-2">
          {PROJECTS.map(project => (
            <div key={project.id} className="bg-gray-800/30 rounded-lg p-2 border border-gray-700">
              <div className="text-white text-xs font-medium">{project.name}</div>
              <div className="text-gray-500 text-xs mb-2">{project.budget} млн ₽</div>
              <div className="flex gap-1">
                {TEAMS.map((_, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => handleAssign(project.id, tIdx)}
                    className={`flex-1 text-xs py-1 rounded ${assignments[project.id] === tIdx ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                  >
                    {tIdx + 1}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCheck}
          disabled={!allAssigned || !withinLimits}
          className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors ${allAssigned && withinLimits ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
        >
          {allAssigned && withinLimits ? '✓ Проверить' : !allAssigned ? `Назначено: ${Object.keys(assignments).length}/9` : 'Превышен лимит бюджета!'}
        </button>
      </div>
    </div>
  );
};
