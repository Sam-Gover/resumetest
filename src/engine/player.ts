import * as THREE from 'three';

/**
 * Player Controller — управление камерой от третьего лица
 * WASD — перемещение, мышь — вращение камеры
 */
export class PlayerController {
  camera: THREE.PerspectiveCamera;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  private keys: Set<string> = new Set();
  private mouseMovement = { x: 0, y: 0 };
  private cameraAngle = { theta: 0, phi: Math.PI / 4 };
  private cameraDistance = 30;
  private moveSpeed = 20;
  private isPointerLocked = false;
  private targetPosition: THREE.Vector3 | null = null;
  private isTeleporting = false;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.position = new THREE.Vector3(0, 0, 20);
    this.velocity = new THREE.Vector3();

    this.setupControls();
  }

  private setupControls() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // Mouse movement for camera rotation
    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseMovement.x += e.movementX;
        this.mouseMovement.y += e.movementY;
      }
    });

    // Pointer lock
    document.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
    });

    // Scroll for zoom
    document.addEventListener('wheel', (e) => {
      this.cameraDistance += e.deltaY * 0.02;
      this.cameraDistance = Math.max(10, Math.min(60, this.cameraDistance));
    });
  }

  /**
   * Телепортация к зданию
   */
  teleportTo(position: THREE.Vector3) {
    this.targetPosition = position.clone();
    this.targetPosition.y = 0;
    this.isTeleporting = true;
  }

  update(delta: number) {
    // Camera rotation from mouse
    if (this.isPointerLocked) {
      this.cameraAngle.theta -= this.mouseMovement.x * 0.003;
      this.cameraAngle.phi -= this.mouseMovement.y * 0.003;
      this.cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2.5, this.cameraAngle.phi));
      this.mouseMovement.x = 0;
      this.mouseMovement.y = 0;
    }

    // Teleportation animation
    if (this.isTeleporting && this.targetPosition) {
      const direction = this.targetPosition.clone().sub(this.position);
      const distance = direction.length();
      
      if (distance < 1) {
        this.position.copy(this.targetPosition);
        this.isTeleporting = false;
        this.targetPosition = null;
      } else {
        direction.normalize().multiplyScalar(Math.min(this.moveSpeed * 3 * delta, distance));
        this.position.add(direction);
      }
    }

    // Movement (WASD)
    const moveDir = new THREE.Vector3();
    
    if (this.keys.has('w') || this.keys.has('ц')) moveDir.z -= 1;
    if (this.keys.has('s') || this.keys.has('ы')) moveDir.z += 1;
    if (this.keys.has('a') || this.keys.has('ф')) moveDir.x -= 1;
    if (this.keys.has('d') || this.keys.has('в')) moveDir.x += 1;

    if (moveDir.length() > 0) {
      moveDir.normalize();
      // Rotate movement direction by camera angle
      const angle = this.cameraAngle.theta;
      const rotatedX = moveDir.x * Math.cos(angle) - moveDir.z * Math.sin(angle);
      const rotatedZ = moveDir.x * Math.sin(angle) + moveDir.z * Math.cos(angle);
      
      this.position.x += rotatedX * this.moveSpeed * delta;
      this.position.z += rotatedZ * this.moveSpeed * delta;
    }

    // Clamp position to world bounds
    this.position.x = Math.max(-90, Math.min(90, this.position.x));
    this.position.z = Math.max(-90, Math.min(90, this.position.z));
    this.position.y = 0;

    // Update camera position (orbit around player)
    const camX = this.position.x + this.cameraDistance * Math.sin(this.cameraAngle.phi) * Math.sin(this.cameraAngle.theta);
    const camY = this.position.y + this.cameraDistance * Math.cos(this.cameraAngle.phi);
    const camZ = this.position.z + this.cameraDistance * Math.sin(this.cameraAngle.phi) * Math.cos(this.cameraAngle.theta);

    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
    this.camera.lookAt(this.position.x, 2, this.position.z);
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  isMoving(): boolean {
    return this.keys.has('w') || this.keys.has('s') || this.keys.has('a') || this.keys.has('d') ||
           this.keys.has('ц') || this.keys.has('ы') || this.keys.has('ф') || this.keys.has('в');
  }
}
