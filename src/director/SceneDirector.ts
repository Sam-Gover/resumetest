import * as THREE from 'three';
import type { ResumeData } from '../types';

/**
 * SceneDirector — управляет рельсовой камерой и переходами между сценами
 */
export class SceneDirector {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private resumeData: ResumeData;
  private currentSceneIndex = -1;
  private sceneOrder: string[] = [];
  private isTransitioning = false;
  private transitionCallback: (() => void) | null = null;

  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene, data: ResumeData) {
    this.camera = camera;
    this.scene = scene;
    this.resumeData = data;
  }

  setSceneOrder(order: string[]) {
    this.sceneOrder = order;
  }

  getCurrentSceneIndex(): number {
    return this.currentSceneIndex;
  }

  getCurrentSceneId(): string | null {
    if (this.currentSceneIndex < 0 || this.currentSceneIndex >= this.sceneOrder.length) {
      return null;
    }
    return this.sceneOrder[this.currentSceneIndex];
  }

  getTotalScenes(): number {
    return this.sceneOrder.length;
  }

  /**
   * Интро — облёт камерой города
   */
  async playIntro(): Promise<void> {
    return new Promise((resolve) => {
      const points = [
        new THREE.Vector3(0, 30, 50),
        new THREE.Vector3(-15, 25, 30),
        new THREE.Vector3(-20, 20, 10),
        new THREE.Vector3(0, 15, -10),
        new THREE.Vector3(20, 20, -15),
        new THREE.Vector3(0, 25, -30),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const duration = 6000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutQuad(t);
        const pos = curve.getPoint(eased);
        this.camera.position.copy(pos);
        this.camera.lookAt(0, 0, -10);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  }

  /**
   * Переход к следующей сцене
   */
  async transitionToScene(sceneId: string): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const sceneConfig = this.resumeData.scenes[sceneId as keyof typeof this.resumeData.scenes];
    if (!sceneConfig) {
      this.isTransitioning = false;
      return;
    }

    const buildingId = sceneConfig.building;
    const building = this.resumeData.work.find(w => w.id === buildingId);
    if (!building) {
      this.isTransitioning = false;
      return;
    }

    const [bx, by, bz] = building.game.position;
    const targetPos = new THREE.Vector3(bx, 15, bz + 20);
    const targetLookAt = new THREE.Vector3(bx, by + 5, bz);

    const startPos = this.camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, -10);
    const duration = 2000;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutQuad(t);

        this.camera.position.lerpVectors(startPos, targetPos, eased);
        const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, eased);
        this.camera.lookAt(currentLookAt);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isTransitioning = false;
          resolve();
        }
      };
      animate();
    });
  }

  /**
   * Переход к финалу
   */
  async transitionToFinale(): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const targetPos = new THREE.Vector3(0, 30, 50);
    const startPos = this.camera.position.clone();
    const duration = 3000;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutQuad(t);

        this.camera.position.lerpVectors(startPos, targetPos, eased);
        this.camera.lookAt(0, 0, -10);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isTransitioning = false;
          resolve();
        }
      };
      animate();
    });
  }

  nextScene(): string | null {
    this.currentSceneIndex++;
    if (this.currentSceneIndex >= this.sceneOrder.length) {
      return null;
    }
    return this.sceneOrder[this.currentSceneIndex];
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}
