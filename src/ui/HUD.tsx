import React, { useState, useEffect, useCallback } from 'react';
import type { Ability, WorkExperience, ResumeData } from '../types';

interface HUDProps {
  resumeData: ResumeData | null;
  activeAbility: string | null;
  cooldowns: Record<string, number>;
  selectedBuilding: WorkExperience | null;
  gameState: string;
  completedScenarios: string[];
  onAbilityActivate: (id: string) => void;
  onBuildingSelect: (work: WorkExperience) => void;
  onCloseBuilding: () => void;
  onCompleteScenario: () => void;
}

/**
 * HUD — основной интерфейс игры
 * Показывает способности, информацию о зданиях, прогресс
 */
export const HUD: React.FC<HUDProps> = ({
  resumeData,
  activeAbility,
  cooldowns,
  selectedBuilding,
  gameState,
  completedScenarios,
  onAbilityActivate,
  onBuildingSelect,
  onCloseBuilding,
  onCompleteScenario,
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showScenario, setShowScenario] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowInventory(prev => !prev);
      }
      if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
        setShowMap(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowInventory(false);
        setShowMap(false);
        setShowScenario(false);
        if (selectedBuilding) onCloseBuilding();
      }
      // Ability hotkeys 1-7
      const num = parseInt(e.key);
      if (num >= 1 && num <= 7 && resumeData) {
        const ability = resumeData.abilities[num - 1];
        if (ability) onAbilityActivate(ability.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resumeData, onAbilityActivate, selectedBuilding, onCloseBuilding]);

  if (!resumeData) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top bar - Player info */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
          <h2 className="text-cyan-400 font-bold text-sm">{resumeData.basics.name}</h2>
          <p className="text-gray-400 text-xs">{resumeData.basics.label}</p>
          <div className="mt-1 text-xs text-gray-500">
            Состояние: <span className="text-green-400">{gameState}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Пройдено: {completedScenarios.length}/{resumeData.work.length} сценариев
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30 text-xs text-gray-400">
          <div>WASD — движение</div>
          <div>Мышь — камера</div>
          <div>1-7 — способности</div>
          <div>Tab — инвентарь</div>
          <div>M — карта</div>
          <div>Клик — взаимодействие</div>
        </div>
      </div>

      {/* Ability bar - bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {resumeData.abilities.map((ability, index) => (
          <AbilitySlot
            key={ability.id}
            ability={ability}
            index={index}
            isActive={activeAbility === ability.id}
            cooldown={cooldowns[ability.id] || 0}
            onClick={() => onAbilityActivate(ability.id)}
          />
        ))}
      </div>

      {/* Active ability indicator */}
      {activeAbility && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-cyan-500/50 pointer-events-none">
          <p className="text-cyan-300 text-sm text-center">
            ✨ {resumeData.abilities.find(a => a.id === activeAbility)?.name} активна
          </p>
        </div>
      )}

      {/* Building info panel */}
      {selectedBuilding && !showScenario && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30 max-w-lg pointer-events-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-cyan-400">{selectedBuilding.name}</h3>
              <p className="text-gray-400 text-sm">{selectedBuilding.position}</p>
            </div>
            <button
              onClick={onCloseBuilding}
              className="text-gray-500 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">{selectedBuilding.summary}</p>
          
          {selectedBuilding.highlights && (
            <div className="mb-4">
              <h4 className="text-xs text-gray-500 uppercase mb-2">Достижения</h4>
              <div className="flex flex-wrap gap-1">
                {selectedBuilding.highlights.map((h, i) => (
                  <span key={i} className="bg-cyan-900/50 text-cyan-300 text-xs px-2 py-1 rounded">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedBuilding.metrics && (
            <div className="mb-4">
              <h4 className="text-xs text-gray-500 uppercase mb-2">Метрики</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedBuilding.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-gray-500">{key}</div>
                    <div className="text-sm text-white font-mono">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedBuilding.scenario && (
            <button
              onClick={() => setShowScenario(true)}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              🎮 Начать сценарий: {selectedBuilding.scenario.title}
            </button>
          )}
        </div>
      )}

      {/* Scenario panel */}
      {showScenario && selectedBuilding?.scenario && (
        <ScenarioPanel
          scenario={selectedBuilding.scenario}
          buildingName={selectedBuilding.name}
          onComplete={onCompleteScenario}
          onClose={() => setShowScenario(false)}
        />
      )}

      {/* Inventory overlay */}
      {showInventory && (
        <InventoryPanel
          abilities={resumeData.abilities}
          skills={resumeData.skills}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* Minimap */}
      {showMap && (
        <Minimap
          resumeData={resumeData}
          completedScenarios={completedScenarios}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* Always show minimap in corner */}
      {!showMap && (
        <div className="absolute bottom-6 right-6 pointer-events-none">
          <div className="w-32 h-32 bg-black/60 backdrop-blur-sm rounded-lg border border-cyan-500/30 overflow-hidden">
            <MiniMapContent resumeData={resumeData} completedScenarios={completedScenarios} />
          </div>
        </div>
      )}
    </div>
  );
};

// Ability slot component
const AbilitySlot: React.FC<{
  ability: Ability;
  index: number;
  isActive: boolean;
  cooldown: number;
  onClick: () => void;
}> = ({ ability, index, isActive, cooldown, onClick }) => {
  const isOnCooldown = cooldown > 0;
  
  return (
    <button
      onClick={onClick}
      className={`
        relative w-14 h-14 rounded-lg border-2 transition-all
        ${isActive ? 'border-cyan-400 bg-cyan-900/50 scale-110' : 'border-gray-600 bg-gray-900/80 hover:border-gray-400'}
        ${isOnCooldown ? 'opacity-50' : ''}
      `}
      title={`${ability.name} (${ability.description})`}
    >
      <span className="text-2xl">{ability.icon}</span>
      <span className="absolute -top-1 -right-1 bg-gray-800 text-xs text-gray-400 w-4 h-4 rounded flex items-center justify-center">
        {index + 1}
      </span>
      {isOnCooldown && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
          <span className="text-xs text-white">{Math.ceil(cooldown)}s</span>
        </div>
      )}
    </button>
  );
};

// Scenario panel
const ScenarioPanel: React.FC<{
  scenario: { title: string; description: string; steps: { id: string; text: string; type: string }[] };
  buildingName: string;
  onComplete: () => void;
  onClose: () => void;
}> = ({ scenario, buildingName, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepComplete = () => {
    const step = scenario.steps[currentStep];
    if (step) {
      setCompletedSteps(prev => new Set([...prev, step.id]));
      if (currentStep < scenario.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 max-w-md pointer-events-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-purple-400">🎯 {scenario.title}</h3>
          <p className="text-gray-500 text-xs">{buildingName}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">{scenario.description}</p>
      
      <div className="space-y-2 mb-4">
        {scenario.steps.map((step, i) => (
          <div
            key={step.id}
            className={`p-2 rounded text-sm ${
              completedSteps.has(step.id)
                ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                : i === currentStep
                ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                : 'bg-gray-800/30 text-gray-500'
            }`}
          >
            <span className="mr-2">
              {completedSteps.has(step.id) ? '✅' : i === currentStep ? '▶️' : '○'}
            </span>
            {step.text}
          </div>
        ))}
      </div>

      {currentStep < scenario.steps.length && !completedSteps.has(scenario.steps[currentStep]?.id) && (
        <button
          onClick={handleStepComplete}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Выполнить шаг ({currentStep + 1}/{scenario.steps.length})
        </button>
      )}

      {completedSteps.size === scenario.steps.length && (
        <div className="text-center">
          <p className="text-green-400 font-bold mb-2">🎉 Сценарий завершён!</p>
          <button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg"
          >
            Получить награду
          </button>
        </div>
      )}
    </div>
  );
};

// Inventory panel
const InventoryPanel: React.FC<{
  abilities: Ability[];
  skills: { id: string; name: string; level: number; category: string }[];
  onClose: () => void;
}> = ({ abilities, skills, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
      <div className="bg-gray-900/95 rounded-xl p-6 border border-cyan-500/30 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cyan-400">📦 Инвентарь способностей</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {abilities.map(ability => (
            <div key={ability.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{ability.icon}</span>
                <div>
                  <h3 className="text-white font-medium">{ability.name}</h3>
                  <p className="text-xs text-gray-500">Клавиша: {ability.hotkey} | КД: {ability.cooldown}с</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">{ability.description}</p>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-bold text-cyan-400 mt-6 mb-3">📊 Навыки</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {skills.map(skill => (
            <div key={skill.id} className="bg-gray-800/30 rounded p-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{skill.name}</span>
                <span className="text-cyan-400">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-cyan-500 h-1.5 rounded-full"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Minimap component
const Minimap: React.FC<{
  resumeData: ResumeData;
  completedScenarios: string[];
  onClose: () => void;
}> = ({ resumeData, completedScenarios, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
      <div className="bg-gray-900/95 rounded-xl p-6 border border-cyan-500/30 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-400">🗺️ Карта мира</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <div className="relative w-full aspect-square bg-gray-800/50 rounded-lg border border-gray-700">
          {/* Districts */}
          {resumeData.worldConfig.districts.map(district => (
            <div
              key={district.id}
              className="absolute w-16 h-16 rounded-full border-2 border-dashed opacity-30"
              style={{
                borderColor: district.color || '#1a1a4e',
                left: `${(district.center.x + 50) / 100 * 100}%`,
                top: `${(district.center.z + 50) / 100 * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                {district.name}
              </span>
            </div>
          ))}
          {/* Buildings */}
          {resumeData.work.map(work => (
            <div
              key={work.id}
              className={`absolute w-4 h-4 rounded-sm ${
                completedScenarios.includes(work.id) ? 'bg-green-500' : 'bg-cyan-500'
              }`}
              style={{
                left: `${(work.worldPosition.x + 50) / 100 * 100}%`,
                top: `${(work.worldPosition.z + 50) / 100 * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={work.name}
            />
          ))}
          {/* Hub */}
          <div
            className="absolute w-5 h-5 rounded-full bg-yellow-500 border-2 border-yellow-300"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            title="HUB"
          />
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-cyan-500 inline-block" /> Доступно
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Пройдено
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> HUB
          </span>
        </div>
      </div>
    </div>
  );
};

// Mini map content for corner
const MiniMapContent: React.FC<{
  resumeData: ResumeData;
  completedScenarios: string[];
}> = ({ resumeData, completedScenarios }) => {
  return (
    <div className="relative w-full h-full">
      {resumeData.work.map(work => (
        <div
          key={work.id}
          className={`absolute w-2 h-2 rounded-sm ${
            completedScenarios.includes(work.id) ? 'bg-green-500' : 'bg-cyan-500'
          }`}
          style={{
            left: `${(work.worldPosition.x + 50) / 100 * 100}%`,
            top: `${(work.worldPosition.z + 50) / 100 * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-yellow-500"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};

// Loading screen
export const LoadingScreen: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[100]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">CareerForge</h1>
        <p className="text-gray-400 mb-8">The System Architect's Journey</p>
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-600 text-sm mt-2">
          {progress < 30 ? 'Загрузка данных...' : progress < 60 ? 'Генерация мира...' : progress < 90 ? 'Инициализация способностей...' : 'Готово!'}
        </p>
      </div>
    </div>
  );
};
