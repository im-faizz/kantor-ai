import { Application, Container } from 'pixi.js';
import { CameraController } from './world/camera';
import { WorldRenderer } from './world/world-renderer';
import { AgentManager } from './agents/agent-manager';
import { UIManager } from './ui/ui-manager';
import './ui/styles.css';

async function bootstrap() {
  const canvasContainer = document.getElementById('canvas-container')!;
  const uiOverlay = document.getElementById('ui-overlay')!;

  // Limit devicePixelRatio to max 2 for 60fps performance on mobile / laptops
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const app = new Application();
  await app.init({
    background: '#0f1830',
    resizeTo: window,
    resolution: dpr,
    autoDensity: true,
    antialias: true
  });

  canvasContainer.appendChild(app.canvas);

  // World container holding all 2D isometric elements
  const worldContainer = new Container();
  app.stage.addChild(worldContainer);

  // Initialize camera controller
  const camera = new CameraController({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  });

  // Initialize isometric world renderer (floors, walls, furniture, labels)
  const worldRenderer = new WorldRenderer();
  worldContainer.addChild(worldRenderer.rootContainer);

  // Initialize agent manager (sprites, animations, AI states)
  // Agents are added inside the sorted objects container
  const agentManager = new AgentManager(worldRenderer.objectsContainer);

  // Initialize UI manager (top bar, drawer, modal, activity log, camera controls)
  const uiManager = new UIManager(uiOverlay, agentManager, camera);

  // Handle Tab visibility: pause simulation when tab is hidden
  let isTabActive = true;
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  // Main game / animation ticker
  app.ticker.add((ticker) => {
    if (!isTabActive) return;

    const deltaSec = ticker.deltaTime / 60; // seconds

    camera.update(deltaSec);
    agentManager.update(deltaSec);
    worldRenderer.update(deltaSec);

    // Apply camera transform to world container
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    worldContainer.position.set(centerX + camera.x, centerY + camera.y);
    worldContainer.scale.set(camera.z, camera.z);
  });

  // Window resize handler
  window.addEventListener('resize', () => {
    camera.updateViewport(window.innerWidth, window.innerHeight);
  });

  // Touch and Mouse interaction handling
  const activePointers = new Map<number, { x: number; y: number }>();

  canvasContainer.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1) {
        camera.startDrag(e.clientX, e.clientY);
      }
      try {
        canvasContainer.setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignore if pointer capture not supported
      }
    },
    { passive: false }
  );

  canvasContainer.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      if (!activePointers.has(e.pointerId)) return;

      const prev = activePointers.get(e.pointerId)!;

      if (activePointers.size === 1) {
        camera.dragMove(e.clientX, e.clientY);
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      } else if (activePointers.size === 2) {
        // Multi-touch pinch zoom
        let other: { x: number; y: number } | null = null;
        for (const [k, v] of activePointers) {
          if (k !== e.pointerId) {
            other = v;
            break;
          }
        }

        if (other) {
          const d0 = Math.hypot(prev.x - other.x, prev.y - other.y);
          activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const d1 = Math.hypot(e.clientX - other.x, e.clientY - other.y);

          if (d0 > 0) {
            const midX = (e.clientX + other.x) / 2;
            const midY = (e.clientY + other.y) / 2;
            camera.zoomAt(midX, midY, d1 / d0);
          }
        }
      }
    },
    { passive: false }
  );

  const onPointerUp = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      camera.endDrag();
    }
  };

  canvasContainer.addEventListener('pointerup', onPointerUp);
  canvasContainer.addEventListener('pointercancel', onPointerUp);

  // Mouse wheel zoom
  canvasContainer.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      camera.zoomAt(e.clientX, e.clientY, factor);
    },
    { passive: false }
  );
}

if (document.getElementById('canvas-container')) {
  bootstrap();
} else {
  document.addEventListener('DOMContentLoaded', bootstrap);
}
