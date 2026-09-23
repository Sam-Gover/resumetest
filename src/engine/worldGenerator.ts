import * as THREE from 'three';
import type { ResumeData, WorkExperience, District } from '../types';

/**
 * World Generator — создаёт 3D-мир на основе данных из resume.json
 * Все здания, районы, объекты генерируются динамически из JSON
 */
export class WorldGenerator {
  private scene: THREE.Scene;
  private buildings: Map<string, THREE.Group> = new Map();
  private interactables: THREE.Object3D[] = [];
  private districtMarkers: Map<string, THREE.Mesh> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Генерирует весь мир из данных резюме
   */
  generate(data: ResumeData): void {
    this.createGround(data.worldConfig.groundSize);
    this.createGrid(data.worldConfig.groundSize);
    this.createDistricts(data.worldConfig.districts);
    this.createBuildings(data.work);
    this.createHubPortal(data.worldConfig.hubPosition);
    this.createParticles();
  }

  private createGround(size: number) {
    // Main ground plane
    const groundGeo = new THREE.PlaneGeometry(size, size, 50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a2e,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Glowing grid overlay
    const gridHelper = new THREE.GridHelper(size, 40, 0x1a1a6e, 0x0a0a4e);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  private createGrid(size: number) {
    // Circuit-like lines on the ground
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0044aa,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = -size / 2; i <= size / 2; i += 10) {
      const points = [
        new THREE.Vector3(i, 0.02, -size / 2),
        new THREE.Vector3(i, 0.02, size / 2),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.scene.add(line);
    }
  }

  private createDistricts(districts: District[]) {
    districts.forEach(district => {
      // District marker ring
      const ringGeo = new THREE.RingGeometry(12, 14, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(district.color || '#1a1a4e'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(district.center.x, 0.05, district.center.z);
      this.scene.add(ring);
      this.districtMarkers.set(district.id, ring);

      // District label (floating text plane)
      const labelGeo = new THREE.PlaneGeometry(8, 1.5);
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 96;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 96);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(district.name, 256, 56);

      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(district.center.x, 15, district.center.z);
      this.scene.add(label);
    });
  }

  /**
   * Создаёт здания-проекты из данных work[]
   * Каждое здание — интерактивный объект с информацией
   */
  private createBuildings(workExperiences: WorkExperience[]) {
    workExperiences.forEach(work => {
      const building = this.createBuilding(work);
      this.buildings.set(work.id, building);
      this.scene.add(building);
      this.interactables.push(building);
    });
  }

  private createBuilding(work: WorkExperience): THREE.Group {
    const group = new THREE.Group();
    const scale = work.buildingScale || { x: 5, y: 8, z: 5 };
    const pos = work.worldPosition;

    // Main building body
    const bodyGeo = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
    const themeColor = this.getThemeColor(work.buildingTheme);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      roughness: 0.3,
      metalness: 0.7,
      emissive: themeColor,
      emissiveIntensity: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = scale.y / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Window grid (glowing lines)
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
    });
    for (let wy = 1; wy < scale.y - 1; wy += 2) {
      for (let wx = -scale.x / 2 + 1; wx < scale.x / 2; wx += 1.5) {
        const windowGeo = new THREE.PlaneGeometry(0.8, 1.2);
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(wx, wy, scale.z / 2 + 0.01);
        group.add(windowMesh);

        // Back side windows
        const backWindow = windowMesh.clone();
        backWindow.position.z = -scale.z / 2 - 0.01;
        backWindow.rotation.y = Math.PI;
        group.add(backWindow);
      }
    }

    // Roof antenna / beacon
    const antennaGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
    });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = scale.y + 1.5;
    group.add(antenna);

    // Beacon light
    const beaconGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: themeColor,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = scale.y + 3;
    group.add(beacon);

    // Name label
    const labelMesh = this.createTextLabel(work.name, themeColor);
    labelMesh.position.y = scale.y + 5;
    group.add(labelMesh);

    // Position label
    const posLabel = this.createTextLabel(work.position, 0xaaaaaa, 0.6);
    posLabel.position.y = scale.y + 3.8;
    group.add(posLabel);

    // Base platform (glowing)
    const baseGeo = new THREE.CylinderGeometry(
      Math.max(scale.x, scale.z) * 0.8,
      Math.max(scale.x, scale.z) * 0.9,
      0.3,
      32
    );
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

    group.position.set(pos.x, pos.y, pos.z);
    group.userData = { type: 'building', workId: work.id, workData: work };

    return group;
  }

  private createTextLabel(text: string, color: number, opacity = 1.0): THREE.Mesh {
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
    ctx.globalAlpha = opacity;
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

  private createHubPortal(position: { x: number; y: number; z: number }) {
    // Central hub portal
    const portalGeo = new THREE.TorusGeometry(3, 0.3, 16, 32);
    const portalMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      metalness: 0.9,
    });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(position.x, 3, position.z);
    portal.rotation.x = Math.PI / 2;
    this.scene.add(portal);

    // Hub platform
    const platformGeo = new THREE.CylinderGeometry(5, 5, 0.5, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a4e,
      emissive: 0x0044aa,
      emissiveIntensity: 0.2,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(position.x, 0.25, position.z);
    this.scene.add(platform);

    // Hub label
    const label = this.createTextLabel('⬡ HUB ⬡', 0x00ffff);
    label.position.set(position.x, 6, position.z);
    this.scene.add(label);
  }

  private createParticles() {
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
      blue: 0x2244aa,
      green: 0x22aa44,
      purple: 0x8822aa,
      orange: 0xaa6622,
      red: 0xaa2222,
      cyan: 0x22aaaa,
    };
    return colors[theme] || 0x4444aa;
  }

  getBuildings(): Map<string, THREE.Group> {
    return this.buildings;
  }

  getInteractables(): THREE.Object3D[] {
    return this.interactables;
  }
}
