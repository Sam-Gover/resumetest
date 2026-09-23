import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneManager } from './engine/scene';
import { WorldGenerator } from './engine/worldGenerator';
import { SceneDirector } from './director/SceneDirector';
import { audio } from './audio/AudioManager';
import { RoleSelector } from './onboarding/RoleSelector';
import { Tutorial } from './onboarding/Tutorial';
import { AntifraudScene } from './minigames/AntifraudScene';
import { MVPScene } from './minigames/MVPScene';
import { IntegrationScene } from './minigames/IntegrationScene';
import { PortfolioScene } from './minigames/PortfolioScene';
import { RolloutScene } from './minigames/RolloutScene';
import { FinaleScene } from './minigames/FinaleScene';
import { GameHUD } from './ui/GameHUD';
import type { ResumeData, GameState } from './types';
import resumeDataRaw from '../data/resume.json';

type AppPhase = 'loading' | 'roleSelect' | 'tutorial' | 'intro' | 'playing' | 'finale';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const worldGenRef = useRef<WorldGenerator | null>(null);
  const directorRef = useRef<SceneDirector | null>(null);

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [gameState, setGameState] = useState<GameState>({
    currentScene: null,
    sceneIndex: 0,
    totalScenes: 5,
    score: 0,
    sceneScores: {},
    achievements: [],
    startTime: 0,
    endTime: null,
    role: null,
  });
  const [muted, setMuted] = useState(false);

  // Инициализация 3D-сцены
  useEffect(() => {
    if (!containerRef.current) return;

    const data = resumeDataRaw as unknown as ResumeData;
    setResumeData(data);

    const sceneManager = new SceneManager(containerRef.current);
    sceneManagerRef.current = sceneManager;

    sceneManager.setupLighting();
    sceneManager.createSkybox();

    const worldGen = new WorldGenerator(sceneManager.scene);
    worldGenRef.current = worldGen;
    worldGen.generate(data);

    const director = new SceneDirector(sceneManager.camera, sceneManager.scene, data);
    directorRef.current = director;

    sceneManager.start();

    setTimeout(() => setPhase('roleSelect'), 1000);
  }, []);

  // Выбор роли
  const handleRoleSelect = (roleId: string) => {
    if (!resumeData || !directorRef.current) return;
    
    audio.init();
    audio.click();
    
    const role = resumeData.roles[roleId];
    if (!role) return;

    directorRef.current.setSceneOrder(role.sceneOrder);
    setGameState(prev => ({ ...prev, role: roleId, totalScenes: role.sceneOrder.length, startTime: Date.now() }));
    setPhase('tutorial');
  };

  // Туториал завершён
  const handleTutorialComplete = async () => {
    audio.click();
    setPhase('intro');
    
    if (directorRef.current) {
      await directorRef.current.playIntro();
    }
    
    startNextScene();
  };

  // Запуск следующей сцены
  const startNextScene = async () => {
    if (!directorRef.current || !resumeData) return;

    const nextSceneId = directorRef.current.nextScene();
    if (!nextSceneId) {
      // Все сцены пройдены — финал
      setGameState(prev => ({ ...prev, endTime: Date.now() }));
      await directorRef.current.transitionToFinale();
      audio.fanfare();
      setPhase('finale');
      return;
    }

    setGameState(prev => ({ ...prev, currentScene: nextSceneId, sceneIndex: prev.sceneIndex + 1 }));
    await directorRef.current.transitionToScene(nextSceneId);
    setPhase('playing');
  };

  // Завершение сцены
  const handleSceneComplete = (sceneId: string, score: number, metrics: Record<string, unknown>) => {
    audio.success();
    setGameState(prev => ({
      ...prev,
      score: prev.score + score,
      sceneScores: { ...prev.sceneScores, [sceneId]: score },
    }));

    setTimeout(() => startNextScene(), 1200);
  };

  // Пропуск сцены
  const handleSkipScene = () => {
    if (!gameState.currentScene) return;
    audio.click();
    handleSceneComplete(gameState.currentScene, 0, {});
  };

  // Переключение звука
  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    audio.setMuted(newMuted);
  };

  if (!resumeData) return null;

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-950 relative">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* UI Overlays */}
      {phase === 'roleSelect' && <RoleSelector roles={resumeData.roles} onSelect={handleRoleSelect} />}
      
      {phase === 'tutorial' && <Tutorial onComplete={handleTutorialComplete} />}

      {phase === 'playing' && gameState.currentScene && (
        <>
          <GameHUD
            gameState={gameState}
            resumeData={resumeData}
            muted={muted}
            onSkip={handleSkipScene}
            onToggleMute={toggleMute}
          />
          
          {gameState.currentScene === 'antifraud' && (
            <AntifraudScene onComplete={(score: number, metrics: Record<string, unknown>) => handleSceneComplete('antifraud', score, metrics)} />
          )}
          {gameState.currentScene === 'mvp' && (
            <MVPScene onComplete={(score: number, metrics: Record<string, unknown>) => handleSceneComplete('mvp', score, metrics)} />
          )}
          {gameState.currentScene === 'integration' && (
            <IntegrationScene onComplete={(score: number, metrics: Record<string, unknown>) => handleSceneComplete('integration', score, metrics)} />
          )}
          {gameState.currentScene === 'portfolio' && (
            <PortfolioScene onComplete={(score: number, metrics: Record<string, unknown>) => handleSceneComplete('portfolio', score, metrics)} />
          )}
          {gameState.currentScene === 'rollout' && (
            <RolloutScene onComplete={(score: number, metrics: Record<string, unknown>) => handleSceneComplete('rollout', score, metrics)} />
          )}
        </>
      )}

      {phase === 'finale' && (
        <FinaleScene gameState={gameState} resumeData={resumeData} />
      )}
    </div>
  );
};

export default App;
