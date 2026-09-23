import * as THREE from 'three';
import type { ResumeData } from '../types';

/**
 * Scene Manager — управляет Three.js сценой, рендерером, камерой
 */
export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  private animationCallbacks: Array<(delta: number, elapsed: number) => void> = [];

  constructor(container: HTMLElement) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a2e, 0.008);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 25, 40);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Clock
    this.clock = new THREE.Clock();

    // Resize handler
    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  setupLighting(data: ResumeData) {
    const ambientIntensity = data.worldConfig.ambientLight || 0.3;
    const dirIntensity = data.worldConfig.directionalLight || 0.8;

    // Ambient light
    const ambient = new THREE.AmbientLight(0x404080, ambientIntensity);
    this.scene.add(ambient);

    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, dirIntensity);
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

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x00aaff, 2, 50);
    pointLight1.position.set(-20, 10, -15);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff8800, 2, 50);
    pointLight2.position.set(20, 10, 15);
    this.scene.add(pointLight2);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x0044aa, 0x002244, 0.5);
    this.scene.add(hemiLight);
  }

  createSkybox() {
    // Starfield
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

      // Run all animation callbacks
      this.animationCallbacks.forEach(cb => cb(delta, elapsed));

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
