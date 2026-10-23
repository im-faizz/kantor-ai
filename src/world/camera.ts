import { worldToScreen, Point2D } from './iso';

export interface CameraOptions {
  viewportWidth: number;
  viewportHeight: number;
}

export class CameraController {
  public x: number = 0;
  public y: number = 0;
  public z: number = 1.0;

  private vx: number = 0;
  private vy: number = 0;
  private isDragging: boolean = false;
  private lastDragX: number = 0;
  private lastDragY: number = 0;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  public hasDragged: boolean = false;

  private animating: boolean = false;
  private animStartTime: number = 0;
  private animDuration: number = 600; // ms
  private animStartX: number = 0;
  private animStartY: number = 0;
  private animStartZ: number = 1.0;
  private animTargetX: number = 0;
  private animTargetY: number = 0;
  private animTargetZ: number = 1.0;

  public viewportWidth: number;
  public viewportHeight: number;

  constructor(options: CameraOptions) {
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
  }

  public updateViewport(w: number, h: number) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  public startDrag(clientX: number, clientY: number) {
    this.isDragging = true;
    this.hasDragged = false;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.lastDragX = clientX;
    this.lastDragY = clientY;
    this.vx = 0;
    this.vy = 0;
    this.animating = false;
  }

  public dragMove(clientX: number, clientY: number) {
    if (!this.isDragging) return;

    const dx = clientX - this.lastDragX;
    const dy = clientY - this.lastDragY;

    if (!this.hasDragged && Math.hypot(clientX - this.dragStartX, clientY - this.dragStartY) > 5) {
      this.hasDragged = true;
    }

    this.x += dx;
    this.y += dy;

    // Track instant velocity for inertia
    this.vx = dx;
    this.vy = dy;

    this.lastDragX = clientX;
    this.lastDragY = clientY;
    this.clamp();
  }

  public endDrag() {
    this.isDragging = false;
  }

  public zoomAt(cx: number, cy: number, factor: number) {
    const px = cx - this.viewportWidth / 2;
    const py = cy - this.viewportHeight / 2;

    const currentZ = this.z;
    const newZ = Math.min(2.4, Math.max(0.45, currentZ * factor));
    const f = newZ / currentZ;

    this.x = px - (px - this.x) * f;
    this.y = py - (py - this.y) * f;
    this.z = newZ;
    this.animating = false;
    this.clamp();
  }

  public zoomCenter(factor: number) {
    this.zoomAt(this.viewportWidth / 2, this.viewportHeight / 2, factor);
  }

  public resetCamera() {
    this.animateTo(0, 0, 1.0, 600);
  }

  public focusOn(worldX: number, worldY: number, drawerOpen: boolean = false) {
    const pt = worldToScreen(worldX, worldY, 0);
    // Shift slightly left if drawer is open to keep agent visible in the open area
    const offsetX = drawerOpen && this.viewportWidth > 768 ? -140 : 0;
    const targetX = -pt.x * this.z + offsetX;
    const targetY = -pt.y * this.z + 20;

    this.animateTo(targetX, targetY, this.z, 600);
  }

  public animateTo(tx: number, ty: number, tz: number, duration: number = 600) {
    this.animating = true;
    this.animStartTime = performance.now();
    this.animDuration = duration;
    this.animStartX = this.x;
    this.animStartY = this.y;
    this.animStartZ = this.z;
    this.animTargetX = tx;
    this.animTargetY = ty;
    this.animTargetZ = tz;
    this.vx = 0;
    this.vy = 0;
  }

  public update(deltaTime: number) {
    if (this.animating) {
      const now = performance.now();
      const elapsed = now - this.animStartTime;
      const progress = Math.min(1, elapsed / this.animDuration);
      // Smooth easeInOutCubic
      const t =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.x = this.animStartX + (this.animTargetX - this.animStartX) * t;
      this.y = this.animStartY + (this.animTargetY - this.animStartY) * t;
      this.z = this.animStartZ + (this.animTargetZ - this.animStartZ) * t;

      if (progress >= 1) {
        this.animating = false;
      }
      this.clamp();
    } else if (!this.isDragging) {
      // Inertia decay
      if (Math.abs(this.vx) > 0.05 || Math.abs(this.vy) > 0.05) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.clamp();
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    }
  }

  private clamp() {
    const maxBoundX = this.viewportWidth * 0.6 + 600 * this.z;
    const maxBoundY = this.viewportHeight * 0.6 + 450 * this.z;

    this.x = Math.max(-maxBoundX, Math.min(maxBoundX, this.x));
    this.y = Math.max(-maxBoundY, Math.min(maxBoundY, this.y));
  }
}
