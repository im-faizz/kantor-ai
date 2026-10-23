export interface CameraControlsCallbacks {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export class CameraControls {
  public container: HTMLElement;

  constructor(callbacks: CameraControlsCallbacks) {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: absolute;
      left: 24px;
      bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 20;
    `;

    // Zoom In
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'cartoon-btn btn-icon';
    zoomInBtn.setAttribute('aria-label', 'Perbesar');
    zoomInBtn.style.cssText = 'width: 48px; height: 48px; font-size: 28px; line-height: 1;';
    zoomInBtn.textContent = '+';
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onZoomIn();
    });

    // Zoom Out
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'cartoon-btn btn-icon';
    zoomOutBtn.setAttribute('aria-label', 'Perkecil');
    zoomOutBtn.style.cssText = 'width: 48px; height: 48px; font-size: 28px; line-height: 1;';
    zoomOutBtn.textContent = '-';
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onZoomOut();
    });

    // Reset Camera
    const resetBtn = document.createElement('button');
    resetBtn.className = 'cartoon-btn btn-icon';
    resetBtn.setAttribute('aria-label', 'Pusatkan kamera');
    resetBtn.style.cssText = 'width: 48px; height: 48px;';
    resetBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
      </svg>
    `;
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onReset();
    });

    this.container.appendChild(zoomInBtn);
    this.container.appendChild(zoomOutBtn);
    this.container.appendChild(resetBtn);
  }
}
