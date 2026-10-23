import { TaskResultItem } from '../agents/agent-manager';
import { getAgentDef } from '../data/agents';

export class ActivityLogPanel {
  public container: HTMLElement;
  private headerBtn: HTMLButtonElement;
  private countSpan: HTMLSpanElement;
  private chevronSvg: SVGElement;
  private contentList: HTMLElement;

  private isOpen: boolean = true;
  private expandedKey: number | null = null;
  private currentResults: TaskResultItem[] = [];

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'activity-log-panel';
    this.container.style.cssText = `
      position: absolute;
      right: 24px;
      bottom: 24px;
      width: 330px;
      display: flex;
      flex-direction: column;
      background: var(--color-panel);
      border: 3px solid var(--color-border);
      border-radius: 16px;
      box-shadow: 0 6px 0 rgba(0,0,0,0.28);
      overflow: hidden;
      z-index: 20;
    `;

    // Header Button
    this.headerBtn = document.createElement('button');
    this.headerBtn.setAttribute('aria-label', 'Buka atau tutup riwayat aktivitas');
    this.headerBtn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 14px;
      border: 0;
      background: var(--color-panel-header);
      color: #ffffff;
      cursor: pointer;
      text-align: left;
    `;
    this.headerBtn.innerHTML = `
      <span style="width: 9px; height: 9px; border-radius: 50%; background: #34d399; flex: none;"></span>
      <span style="flex: 1; font-family: var(--font-title); font-size: 17px; letter-spacing: 0.02em;">Hasil Tugas</span>
      <span class="count-badge" style="font-family: var(--font-body); font-size: 12px; font-weight: 500; color: #9fb0cf;">0</span>
      <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transition: transform 0.2s ease;">
        <path d="M6 9l6 6 6-6"></path>
      </svg>
    `;

    this.countSpan = this.headerBtn.querySelector('.count-badge') as HTMLSpanElement;
    this.chevronSvg = this.headerBtn.querySelector('.chevron-icon') as unknown as SVGElement;

    this.headerBtn.addEventListener('click', () => {
      this.toggleOpen();
    });

    // Content container
    this.contentList = document.createElement('div');
    this.contentList.style.cssText = `
      max-height: 250px;
      overflow-y: auto;
      padding: 4px 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    this.container.appendChild(this.headerBtn);
    this.container.appendChild(this.contentList);

    this.render();
  }

  public toggleOpen() {
    this.isOpen = !this.isOpen;
    this.contentList.style.display = this.isOpen ? 'flex' : 'none';
    this.chevronSvg.style.transform = this.isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  }

  public setVisible(visible: boolean) {
    this.container.style.display = visible ? 'flex' : 'none';
  }

  public updateResults(results: TaskResultItem[]) {
    this.currentResults = results;
    this.countSpan.textContent = String(results.length);
    this.render();
  }

  private render() {
    this.contentList.innerHTML = '';

    if (this.currentResults.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'padding: 14px 0; font-size: 12px; color: #9fb0cf; text-align: center;';
      emptyDiv.textContent = 'Belum ada hasil. Agen sedang mengerjakan tugas pertama.';
      this.contentList.appendChild(emptyDiv);
      return;
    }

    for (const item of this.currentResults) {
      const def = getAgentDef(item.id);
      const isExpanded = this.expandedKey === item.k;

      const card = document.createElement('button');
      card.style.cssText = `
        display: block;
        width: 100%;
        text-align: left;
        padding: 10px 12px;
        border: 0;
        border-radius: 12px;
        background: var(--color-panel-header);
        color: #ffffff;
        cursor: pointer;
        font-family: var(--font-body);
        box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25);
        transition: background 0.1s ease;
      `;

      card.innerHTML = `
        <div style="display: flex; gap: 7px; align-items: center;">
          <span style="padding: 1px 7px; border-radius: 8px; background: ${def.shirt}; color: #0b1220; font-weight: 700; font-size: 9px; letter-spacing: 0.06em;">${item.tag}</span>
          <span style="font-family: var(--font-title); font-size: 13px; letter-spacing: 0.02em;">${def.name}</span>
          <span style="margin-left: auto; font-size: 10px; color: #8193b3;">${item.time}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9fb0cf" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transform: ${isExpanded ? 'rotate(180deg)' : 'none'}; transition: transform 0.15s ease;">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </div>
        <div style="font-weight: 600; font-size: 13px; line-height: 1.3; color: #ffffff; margin-top: 6px;">${item.title}</div>
        <div style="font-size: 12px; line-height: 1.35; color: #c3d0e6; margin-top: 2px;">${item.sum}</div>
        <div style="display: ${isExpanded ? 'block' : 'none'}; margin-top: 8px; padding-top: 8px; border-top: 1px solid #33466b;">
          <div style="display: flex; align-items: center; gap: 7px; font-weight: 500; font-size: 12px; color: #fde68a;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fde68a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path>
              <path d="M14 3v5h5"></path>
            </svg>
            ${item.file}
          </div>
          <div style="font-size: 11px; color: #9fb0cf; margin-top: 4px;">Dikerjakan ${def.name} (${def.role}) · menunggu review Bima</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.expandedKey = this.expandedKey === item.k ? null : item.k;
        this.render();
      });

      this.contentList.appendChild(card);
    }
  }
}
