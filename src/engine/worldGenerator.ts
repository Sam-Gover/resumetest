import * as THREE from 'three';
import type { ResumeData, WorkExperience } from '../types';

/**
 * WorldGenerator — создаёт 3D-мир из resume.json (рельсовая архитектура v1.0)
 */
export class WorldGenerator {
  private scene: THREE.Scene;
  private buildings: Map<string, THREE.Group> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  generate(data: ResumeData): void {
    this.createGround();
    this.createGrid();
    this.createBuildings(data.work);
    this.createAtmosphere();
  }

  private createGround() {
    const groundGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x05060f,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const gridHelper = new THREE.GridHelper(200, 40, 0x1a1a6e, 0x0a0a4e);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  private createGrid() {
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0044aa,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = -100; i <= 100; i += 10) {
      const points = [
        new THREE.Vector3(i, 0.02, -100),
        new THREE.Vector3(i, 0.02, 100),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.scene.add(line);
    }
  }

  private createBuildings(workExperiences: WorkExperience[]) {
    workExperiences.forEach(work => {
      const building = this.createBuilding(work);
      this.buildings.set(work.id, building);
      this.scene.add(building);
    });
  }

  private createBuilding(work: WorkExperience): THREE.Group {
    const group = new THREE.Group();
    const [px, py, pz] = work.game.position;
    const size = work.game.size;
    const themeColor = this.getThemeColor(work.game.theme);

    // Main building body
    const bodyGeo = new THREE.BoxGeometry(size, size * 1.5, size);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      roughness: 0.3,
      metalness: 0.7,
      emissive: themeColor,
      emissiveIntensity: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = size * 0.75;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Windows
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
    });
    for (let wy = 1; wy < size * 1.5 - 1; wy += 2) {
      for (let wx = -size / 2 + 1; wx < size / 2; wx += 1.5) {
        const windowGeo = new THREE.PlaneGeometry(0.8, 1.2);
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(wx, wy, size / 2 + 0.01);
        group.add(windowMesh);
      }
    }

    // Name label
    const labelMesh = this.createTextLabel(work.name, themeColor);
    labelMesh.position.y = size * 1.5 + 3;
    group.add(labelMesh);

    // Base platform
    const baseGeo = new THREE.CylinderGeometry(size * 0.8, size * 0.9, 0.3, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      emissive: themeColor,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    group.add(base);

    group.position.set(px, py, pz);
    return group;
  }

  private createTextLabel(text: string, color: number): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 64);
    const hexColor = '#' + new THREE.Color(color).getHexString();
    ctx.fillStyle = hexColor;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 42);

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(8, 1);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geo, mat);
  }

  private createAtmosphere() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 30 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

      const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
  }

  private getThemeColor(theme: string): number {
    const colors: Record<string, number> = {
      tech: 0x3b82f6,
      social: 0x22c55e,
      strategy: 0xa855f7,
      bank: 0xeab308,
    };
    return colors[theme] || 0x4444aa;
  }

  getBuildings(): Map<string, THREE.Group> {
    return this.buildings;
  }
}
