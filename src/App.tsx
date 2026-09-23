import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useMachine } from '@xstate/react';
import { gameMachine } from './state/gameMachine';
import { SceneManager } from './engine/scene';
import { WorldGenerator } from './engine/worldGenerator';
import { PlayerController } from './engine/player';
import { AbilitySystem } from './engine/abilities';
import { HUD, LoadingScreen } from './ui/HUD';
import type { ResumeData, WorkExperience } from './types';

// Импорт данных
import resumeDataRaw from '../data/resume.json';
import dialogueDataRaw from '../data/dialogues.json';

/**
 * CareerForge: The System Architect's Journey
 * Главная точка входа — объединяет 3D-движок, React UI и XState
 */
const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const worldGenRef = useRef<WorldGenerator | null>(null);
  const playerRef = useRef<PlayerController | null>(null);
  const abilitySystemRef = useRef<AbilitySystem | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<WorkExperience | null>(null);
  const [activeAbility, setActiveAbility] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(true);

  const [state, send] = useMachine(gameMachine);

  // Инициализация 3D-сцены
  useEffect(() => {
    if (!containerRef.current) return;

    // Simulate loading
    let progress = 0;
    const loadInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadInterval);
      }
      setLoadProgress(progress);
    }, 200);

    // Initialize scene
    const sceneManager = new SceneManager(containerRef.current);
    sceneManagerRef.current = sceneManager;

    // Load and validate data
    const data = resumeDataRaw as unknown as ResumeData;
    setResumeData(data);

    // Setup scene
    sceneManager.setupLighting(data);
    sceneManager.createSkybox();

    // Generate world from data
    const worldGen = new WorldGenerator(sceneManager.scene);
    worldGenRef.current = worldGen;
    worldGen.generate(data);

    // Initialize player
    const player = new PlayerController(sceneManager.camera);
    playerRef.current = player;

    // Initialize ability system
    const abilitySystem = new AbilitySystem(sceneManager.scene);
    abilitySystem.setAbilities(data.abilities);
    abilitySystemRef.current = abilitySystem;

    // Animation loop additions
    sceneManager.addAnimationCallback((delta, elapsed) => {
      player.update(delta);
      abilitySystem.update(delta, elapsed);

      // Animate buildings (subtle float)
      worldGen.getBuildings().forEach((building) => {
        const baseY = building.userData.workData?.worldPosition?.y || 0;
        building.position.y = baseY + Math.sin(elapsed * 0.5 + building.position.x) * 0.1;
      });
    });

    // Start rendering
    sceneManager.start();

    // Signal data loaded
    send({
      type: 'DATA_LOADED',
      abilities: data.abilities.map(a => a.id),
    });

    // Finish loading
    setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearInterval(loadInterval);
      abilitySystem.cleanup();
    };
  }, []);

  // Cooldown timer update
  useEffect(() => {
    const interval = setInterval(() => {
      if (abilitySystemRef.current && resumeData) {
        const newCooldowns: Record<string, number> = {};
        resumeData.abilities.forEach(a => {
          const cd = abilitySystemRef.current!.getCooldown(a.id);
          if (cd > 0) newCooldowns[a.id] = cd;
        });
        setCooldowns(newCooldowns);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [resumeData]);

  // Hide hint on first interaction
  useEffect(() => {
    const hideHint = () => setShowHint(false);
    document.addEventListener('click', hideHint, { once: true });
    return () => document.removeEventListener('click', hideHint);
  }, []);

  // Click handler for building interaction
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!sceneManagerRef.current || !worldGenRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, sceneManagerRef.current.camera);

    const interactables = worldGenRef.current.getInteractables();
    const intersects = raycasterRef.current.intersectObjects(interactables, true);

    if (intersects.length > 0) {
      // Find the building group
      let obj = intersects[0].object;
      while (obj.parent && !obj.userData?.type) {
        obj = obj.parent;
      }

      if (obj.userData?.type === 'building') {
        const workId = obj.userData.workId;
        const workData = resumeData?.work.find(w => w.id === workId);
        if (workData) {
          setSelectedBuilding(workData);
          // Teleport player near the building
          if (playerRef.current) {
            const pos = new THREE.Vector3(
              workData.worldPosition.x,
              0,
              workData.worldPosition.z + 15
            );
            playerRef.current.teleportTo(pos);
          }
          send({ type: 'TELEPORT_TO_BUILDING', buildingId: workId });
        }
      }
    }
  }, [resumeData, send]);

  // Ability activation
  const handleAbilityActivate = useCallback((abilityId: string) => {
    if (!playerRef.current || !abilitySystemRef.current) return;
    
    const position = playerRef.current.getPosition();
    const success = abilitySystemRef.current.activate(abilityId, position);
    
    if (success) {
      setActiveAbility(abilityId);
      send({ type: 'ACTIVATE_ABILITY', abilityId });
      
      // Auto-deactivate after duration
      const ability = resumeData?.abilities.find(a => a.id === abilityId);
      if (ability) {
        setTimeout(() => {
          setActiveAbility(null);
          abilitySystemRef.current?.deactivate(abilityId);
        }, ability.duration * 1000);
      }
    }
  }, [resumeData, send]);

  // Close building panel
  const handleCloseBuilding = useCallback(() => {
    setSelectedBuilding(null);
    send({ type: 'RETURN_TO_HUB' });
  }, [send]);

  // Complete scenario
  const handleCompleteScenario = useCallback(() => {
    if (selectedBuilding) {
      setCompletedScenarios(prev => [...prev, selectedBuilding.id]);
      setSelectedBuilding(null);
      send({ type: 'COMPLETE_SCENARIO', scenarioId: selectedBuilding.id });
    }
  }, [selectedBuilding, send]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-950 relative">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleClick}
      />

      {/* Loading Screen */}
      {loading && <LoadingScreen progress={loadProgress} />}

      {/* HUD Overlay */}
      {!loading && (
        <HUD
          resumeData={resumeData}
          activeAbility={activeAbility}
          cooldowns={cooldowns}
          selectedBuilding={selectedBuilding}
          gameState={state.value as string}
          completedScenarios={completedScenarios}
          onAbilityActivate={handleAbilityActivate}
          onBuildingSelect={(work) => setSelectedBuilding(work)}
          onCloseBuilding={handleCloseBuilding}
          onCompleteScenario={handleCompleteScenario}
        />
      )}

      {/* Click to start overlay */}
      {!loading && showHint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-1000" id="start-hint">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-6 py-3 border border-cyan-500/20">
            <p className="text-cyan-400 text-sm animate-pulse text-center">
              🖱️ Кликните для захвата камеры
            </p>
            <p className="text-gray-500 text-xs text-center mt-1">
              WASD — перемещение • 1-7 — способности • Клик на здание — взаимодействие
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
