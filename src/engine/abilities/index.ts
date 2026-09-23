import * as THREE from 'three';
import type { Ability } from '../../types';

/**
 * Ability System — реализация игровых способностей
 * Каждая способность — отдельный визуальный эффект в 3D-мире
 */
export class AbilitySystem {
  private scene: THREE.Scene;
  private activeEffects: Map<string, THREE.Object3D> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private abilities: Ability[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  setAbilities(abilities: Ability[]) {
    this.abilities = abilities;
  }

  /**
   * Активирует способность по ID
   */
  activate(abilityId: string, playerPosition: THREE.Vector3): boolean {
    const ability = this.abilities.find(a => a.id === abilityId);
    if (!ability) return false;

    // Check cooldown
    const cooldown = this.cooldowns.get(abilityId) || 0;
    if (cooldown > 0) return false;

    // Set cooldown
    this.cooldowns.set(abilityId, ability.cooldown);

    // Remove existing effect
    this.deactivate(abilityId);

    // Create effect based on ability type
    switch (abilityId) {
      case 'requirement_scanner':
        this.createScannerEffect(playerPosition, ability);
        break;
      case 'ai_assistant':
        this.createAIDroneEffect(playerPosition, ability);
        break;
      case 'api_portal':
        this.createPortalEffect(playerPosition, ability);
        break;
      case 'system_installer':
        this.createInstallerEffect(playerPosition, ability);
        break;
      case 'project_launcher':
        this.createLauncherEffect(playerPosition, ability);
        break;
      case 'debug_mode':
        this.createDebugEffect(playerPosition, ability);
        break;
      case 'automation':
        this.createAutomationEffect(playerPosition, ability);
        break;
    }

    return true;
  }

  deactivate(abilityId: string) {
    const effect = this.activeEffects.get(abilityId);
    if (effect) {
      this.scene.remove(effect);
      this.activeEffects.delete(abilityId);
    }
  }

  /**
   * Сканер требований — расширяющееся кольцо, подсвечивающее объекты
   */
  private createScannerEffect(position: THREE.Vector3, ability: Ability) {
    const group = new THREE.Group();
    
    // Expanding ring
    const ringGeo = new THREE.RingGeometry(0.5, 1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ability.color),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(position);
    ring.position.y = 0.5;
    group.add(ring);

    // Scanner beams
    for (let i = 0; i < 8; i++) {
      const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 20, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ability.color),
        transparent: true,
        opacity: 0.4,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      const angle = (i / 8) * Math.PI * 2;
      beam.position.set(
        position.x + Math.cos(angle) * 5,
        10,
        position.z + Math.sin(angle) * 5
      );
      group.add(beam);
    }

    this.scene.add(group);
    this.activeEffects.set(ability.id, group);
  }

  /**
   * AI-Ассистент — летающий дрон
   */
  private createAIDroneEffect(position: THREE.Vector3, ability: Ability) {
    const group = new THREE.Group();
    
    // Drone body
    const bodyGeo = new THREE.OctahedronGeometry(0.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ability.color),
      emissive: new THREE.Color(ability.color),
      emissiveIntensity: 0.5,
      metalness: 0.9,
    });
    const drone = new THREE.Mesh(bodyGeo, bodyMat);
    drone.position.copy(position);
    drone.position.y = 8;
    group.add(drone);

    // Drone light beam
    const beamGeo = new THREE.ConeGeometry(2, 8, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ability.color),
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.copy(position);
    beam.position.y = 4;
    group.add(beam);

    // Orbiting particles
    const particleCount = 20;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * 3;
      positions[i * 3 + 1] = 8 + Math.sin(angle * 2) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(ability.color),
      size: 0.3,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.position.copy(position);
    group.add(particles);

    this.scene.add(group);
    this.activeEffects.set(ability.id, group);
  }

  /**
   * API-Портал — две связанные точки телепортации
   */
  private createPortalEffect(position: THREE.Vector3, ability: Ability) {
    const group = new THREE.Group();
    
    // Portal A
    const portalAGeo = new THREE.TorusGeometry(2, 0.2, 16, 32);
    const portalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ability.color),
      emissive: new THREE.Color(ability.color),
      emissiveIntensity: 0.8,
    });
    const portalA = new THREE.Mesh(portalAGeo, portalMat);
    portalA.position.copy(position);
    portalA.position.y = 3;
    portalA.position.x -= 5;
    group.add(portalA);

    // Portal B
    const portalB = portalA.clone();
    portalB.position.x += 10;
    group.add(portalB);

    // Data stream between portals
    const streamPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      streamPoints.push(new THREE.Vector3(
        position.x - 5 + t * 10,
        3 + Math.sin(t * Math.PI) * 2,
        position.z
      ));
    }
    const streamGeo = new THREE.BufferGeometry().setFromPoints(streamPoints);
    const streamMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(ability.color),
      transparent: true,
      opacity: 0.6,
    });
    const stream = new THREE.Line(streamGeo, streamMat);
    group.add(stream);

    this.scene.add(group);
    this.activeEffects.set(ability.id, group);
  }

  /**
   * Системный инсталлятор — модули на площадках
   */
  private createInstallerEffect(position: THREE.Vector3, ability: Ability) {
    const group = new THREE.Group();
    const modules = ['DB', 'API', 'LOG', 'AUTH'];
    
    modules.forEach((mod, i) => {
      const angle = (i / modules.length) * Math.PI * 2;
      const radius = 6;
      
      // Module box
      const boxGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
      const boxMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ability.color),
        emissive: new THREE.Color(ability.color),
        emissiveIntensity: 0.3,
        metalness: 0.8,
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(
        position.x + Math.cos(angle) * radius,
        1,
        position.z + Math.sin(angle) * radius
      );
      group.add(box);

      // Connection line to center
      const linePoints = [
        new THREE.Vector3(position.x, 0.5, position.z),
        new THREE.Vector3(
          position.x + Math.cos(angle) * radius,
          0.5,
          position.z + Math.sin(angle) * radius
        ),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(ability.color),
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    });

    // Central hub
    const hubGeo = new THREE.CylinderGeometry(1, 1, 0.5, 16);
    const hubMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ability.color),
      emissive: new THREE.Color(ability.color),
      emissiveIntensity: 0.5,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.copy(position);
    hub.position.y = 0.25;
    group.add(hub);

    this.scene.add(group);
    this.activeEffects.set(ability.id, group);
  }

  /**
   * Запуск фазы проекта — NPC-разработчики
   */
  private createLauncherEffect(position: THREE.Vector3, ability: Ability) {
    const group = new THREE.Group();
    
    // NPC developers (simple capsule shapes)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 4;
      
      const npcGeo = new THREE.CapsuleGeometry(0.3, 1, 8, 16);
      const npcMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ability.color),
        emissive: new THREE.Color(ability.color),
        emissiveIntensity: 0.3,
      });
      const npc = new THREE.Mesh(npcGeo, npcMat);
      npc.position.set(
        position.x + Math.cos(angle) * radius,
        1,
        position.z + Math.sin(angle) * radius
      );
      group.add(npc);
    }

    // Task board
    const boardGeo = new THREE.PlaneGeometry(4, 3);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x222244,
      emissive: new THREE.Color(ability.color),
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(position.x, 3, position.z);
    group.add(board);

    this.scene.add(group);
    this.activeEffects.set(ability.id, group);
  }

  /**
   * Режим отладки — подсветка дефектов
   */
  private createDebugEffect(position: THREE.Vector3, ability: Ability) {
    const group = new THREE.Group();
    
    // Bug markers
    for (let i = 0; i < 8; i++) {
      const bugGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const bugMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
      });
      const bug = new THREE.Mesh(bugGeo, bugMat);
      bug.position.set(
        position.x + (Math.random() - 0.5) * 15,
        Math.random() * 5 + 1,
        position.z + (Math.random() - 0.5) * 15
      );
      group.add(bug);

      // Bug label line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        bug.position.clone(),
        bug.position.clone().add(new THREE.Vector3(0, 2, 0)),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff3333,
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    }

    // Scan grid
    const gridGeo = new THREE.PlaneGeometry(20, 20, 10, 10);
    const gridMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ability.color),
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.copy(position);
    grid.position.y = 0.1;
    group.add(grid);

    this.scene.add(group);
    this.activeEffects.set(ability.id, group);
  }

  /**
   * Автоматизация — конвертация данных
   */
  private createAutomationEffect(position: THREE.Vector3, ability: Ability) {
    const group = new THREE.Group();
    
    // Input data stream (left)
    for (let i = 0; i < 5; i++) {
      const docGeo = new THREE.BoxGeometry(0.8, 1, 0.1);
      const docMat = new THREE.MeshStandardMaterial({
        color: 0x888888,
        emissive: 0x444444,
        emissiveIntensity: 0.2,
      });
      const doc = new THREE.Mesh(docGeo, docMat);
      doc.position.set(position.x - 5 - i * 1.5, 2 + i * 0.3, position.z);
      group.add(doc);
    }

    // Processor (center)
    const procGeo = new THREE.BoxGeometry(3, 3, 3);
    const procMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ability.color),
      emissive: new THREE.Color(ability.color),
      emissiveIntensity: 0.5,
      metalness: 0.8,
    });
    const proc = new THREE.Mesh(procGeo, procMat);
    proc.position.copy(position);
    proc.position.y = 2;
    group.add(proc);

    // Output documents (right)
    for (let i = 0; i < 5; i++) {
      const docGeo = new THREE.BoxGeometry(0.8, 1, 0.1);
      const docMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ability.color),
        emissive: new THREE.Color(ability.color),
        emissiveIntensity: 0.3,
      });
      const doc = new THREE.Mesh(docGeo, docMat);
      doc.position.set(position.x + 5 + i * 1.5, 2 + i * 0.3, position.z);
      group.add(doc);
    }

    this.scene.add(group);
    this.activeEffects.set(ability.id, group);
  }

  /**
   * Обновление кулдаунов и анимаций эффектов
   */
  update(delta: number, elapsed: number) {
    // Update cooldowns
    this.cooldowns.forEach((value, key) => {
      const newVal = value - delta;
      if (newVal <= 0) {
        this.cooldowns.delete(key);
      } else {
        this.cooldowns.set(key, newVal);
      }
    });

    // Animate active effects
    this.activeEffects.forEach((effect, id) => {
      switch (id) {
        case 'requirement_scanner':
          effect.children.forEach((child, i) => {
            if (i === 0) {
              // Expanding ring
              child.scale.setScalar(1 + elapsed * 2 % 5);
              (child as THREE.Mesh).material && ((child as any).material.opacity = Math.max(0, 0.8 - (elapsed * 2 % 5) / 5));
            }
          });
          break;
        case 'ai_assistant':
          // Drone orbiting
          if (effect.children[0]) {
            effect.children[0].position.y = 8 + Math.sin(elapsed * 3) * 0.5;
            effect.children[0].rotation.y = elapsed * 2;
          }
          if (effect.children[2]) {
            effect.children[2].rotation.y = elapsed;
          }
          break;
        case 'api_portal':
          // Portal rotation
          if (effect.children[0]) effect.children[0].rotation.z = elapsed * 2;
          if (effect.children[1]) effect.children[1].rotation.z = -elapsed * 2;
          break;
        case 'system_installer':
          // Module pulsing
          effect.children.forEach((child, i) => {
            if (i < 4) {
              child.position.y = 1 + Math.sin(elapsed * 2 + i) * 0.3;
            }
          });
          break;
        case 'project_launcher':
          // NPC movement
          effect.children.forEach((child, i) => {
            if (i < 5) {
              const angle = (i / 5) * Math.PI * 2 + elapsed * 0.5;
              const radius = 4;
              const baseX = effect.position.x;
              const baseZ = effect.position.z;
              child.position.x = baseX + Math.cos(angle) * radius;
              child.position.z = baseZ + Math.sin(angle) * radius;
            }
          });
          break;
        case 'debug_mode':
          // Bug blinking
          effect.children.forEach((child, i) => {
            if (i % 2 === 0 && i < 16) {
              (child as THREE.Mesh).visible = Math.sin(elapsed * 5 + i) > 0;
            }
          });
          break;
      }
    });
  }

  getCooldown(abilityId: string): number {
    return this.cooldowns.get(abilityId) || 0;
  }

  getActiveEffects(): Map<string, THREE.Object3D> {
    return this.activeEffects;
  }

  cleanup() {
    this.activeEffects.forEach((effect) => {
      this.scene.remove(effect);
    });
    this.activeEffects.clear();
    this.cooldowns.clear();
  }
}
