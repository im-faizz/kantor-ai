export interface TopBarCallbacks {
  onOpenDetail: () => void;
  onToggleDrawer: () => void;
}

export class TopBar {
  public container: HTMLElement;
  private teamBtn: HTMLButtonElement;
  private detailBtn: HTMLButtonElement;

  constructor(callbacks: TopBarCallbacks) {
    this.container = document.createElement('div');
    this.container.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; pointer-events: none;';

    // Top-left: Title card + Detail button
    const topLeft = document.createElement('div');
    topLeft.style.cssText = 'position: absolute; left: 24px; top: 20px; display: flex; flex-direction: column; gap: 12px; pointer-events: auto;';

    // Title card
    const titleCard = document.createElement('div');
    titleCard.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 18px 8px 14px;
      border-radius: 16px;
      background: var(--color-panel);
      border: 3px solid var(--color-border);
      box-shadow: 0 5px 0 rgba(0,0,0,0.28);
    `;
    titleCard.innerHTML = `
      <div style="width: 34px; height: 34px; border-radius: 10px; background: var(--color-primary); display: flex; align-items: center; justify-content: center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b2300" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 21V9l9-6 9 6v12"></path>
          <path d="M9 21v-7h6v7"></path>
        </svg>
      </div>
      <div style="font-family: var(--font-title); font-size: 22px; color: #ffffff; letter-spacing: 0.02em;">Kantor AI</div>
    `;

    // Detail button
    this.detailBtn = document.createElement('button');
    this.detailBtn.className = 'cartoon-btn btn-blue';
    this.detailBtn.setAttribute('aria-label', 'Buka detail seluruh agen');
    this.detailBtn.style.cssText = `
      height: 46px;
      padding: 0 18px 0 14px;
      font-size: 16px;
      color: #ffffff;
      width: fit-content;
    `;
    this.detailBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
      </svg>
      Detail Agen
    `;
    this.detailBtn.addEventListener('click', () => callbacks.onOpenDetail());

    topLeft.appendChild(titleCard);
    topLeft.appendChild(this.detailBtn);

    // Top-right: Tim AI button
    const topRight = document.createElement('div');
    topRight.style.cssText = 'position: absolute; right: 24px; top: 20px; pointer-events: auto;';

    this.teamBtn = document.createElement('button');
    this.teamBtn.className = 'cartoon-btn btn-yellow';
    this.teamBtn.setAttribute('aria-label', 'Buka tim karyawan AI');
    this.teamBtn.style.cssText = `
      height: 56px;
      padding: 0 20px 0 16px;
      font-size: 20px;
    `;
    this.teamBtn.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b2300" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="8" r="3.5"></circle>
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"></path>
        <circle cx="17" cy="9" r="2.6"></circle>
        <path d="M17.5 14.2c2.6 0.2 4.5 2 4.5 5.3"></path>
      </svg>
      Tim AI
      <span style="min-width: 26px; height: 26px; padding: 0 6px; box-sizing: border-box; border-radius: 13px; background: #0b1220; color: #fde68a; font-family: var(--font-title); font-size: 15px; display: flex; align-items: center; justify-content: center;">8</span>
    `;
    this.teamBtn.addEventListener('click', () => callbacks.onToggleDrawer());

    topRight.appendChild(this.teamBtn);

    this.container.appendChild(topLeft);
    this.container.appendChild(topRight);
  }

  public setDrawerOpen(isOpen: boolean) {
    this.teamBtn.style.background = isOpen ? '#fde68a' : '#fbbf24';
  }
}
