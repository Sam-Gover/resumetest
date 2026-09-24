import * as THREE from 'three';
import type { ResumeData } from '../types';

/**
 * SceneManager — управляет Three.js сценой (рельсовая архитектура v1.0)
 */
export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  private animationCallbacks: Array<(delta: number, elapsed: number) => void> = [];

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05060f, 0.008);

    // Ensure container has dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000
    );
    this.camera.position.set(0, 30, 50);
    this.camera.lookAt(0, 0, -10);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => {
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(newWidth, newHeight);
    });
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0x404080, 0.3);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.camera.left = -60;
    dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60;
    dirLight.shadow.camera.bottom = -60;
    this.scene.add(dirLight);

    // Rim lights (синий и фиолетовый)
    const blueLight = new THREE.PointLight(0x3b82f6, 2, 80);
    blueLight.position.set(-30, 15, 0);
    this.scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 80);
    purpleLight.position.set(30, 15, 0);
    this.scene.add(purpleLight);

    const hemiLight = new THREE.HemisphereLight(0x0044aa, 0x002244, 0.5);
    this.scene.add(hemiLight);
  }

  createSkybox() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 400;
      positions[i + 1] = Math.random() * 200 + 20;
      positions[i + 2] = (Math.random() - 0.5) * 400;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);

    this.addAnimationCallback((_, elapsed) => {
      stars.rotation.y = elapsed * 0.01;
    });
  }

  addAnimationCallback(callback: (delta: number, elapsed: number) => void) {
    this.animationCallbacks.push(callback);
  }

  start() {
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      this.animationCallbacks.forEach(cb => cb(delta, elapsed));

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
