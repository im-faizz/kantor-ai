import { AGENT_DEFS, AgentDef, getAgentDef } from '../data/agents';
import { AgentRuntimeState, TaskResultItem } from '../agents/agent-manager';
import { TASK_BANK, getOutputFor, OutputPreview } from '../data/tasks';

export interface DetailModalCallbacks {
  onClose: () => void;
  onOpenChat: (agentId: string) => void;
}

export class DetailModal {
  public overlay: HTMLElement;
  private selectedAgentId: string = 'bima';
  private selectedFileKeys: Record<string, number> = {};
  private callbacks: DetailModalCallbacks;

  private sidebarList: HTMLElement;
  private mainContent: HTMLElement;

  private currentAgents: Map<string, AgentRuntimeState> = new Map();
  private currentResults: TaskResultItem[] = [];

  constructor(callbacks: DetailModalCallbacks) {
    this.callbacks = callbacks;

    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
      background: rgba(8, 12, 24, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 32px;
      box-sizing: border-box;
      backdrop-filter: blur(2px);
    `;

    const card = document.createElement('div');
    card.className = 'detail-modal-card';
    card.style.cssText = `
      width: 100%;
      height: 100%;
      max-width: 1260px;
      display: flex;
      background: var(--color-panel);
      border: 3px solid var(--color-border);
      border-radius: 20px;
      box-shadow: 0 10px 0 rgba(0,0,0,0.3);
      overflow: hidden;
    `;

    // 1. Sidebar (width 250px)
    this.sidebarList = document.createElement('div');
    this.sidebarList.className = 'detail-modal-sidebar';
    this.sidebarList.style.cssText = `
      flex: none;
      width: 250px;
      background: var(--color-panel-inner);
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    `;

    // 2. Main content area
    this.mainContent = document.createElement('div');
    this.mainContent.style.cssText = `
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      padding: 24px 28px 28px;
      display: flex;
      flex-direction: column;
    `;

    card.appendChild(this.sidebarList);
    card.appendChild(this.mainContent);
    this.overlay.appendChild(card);

    // Close on clicking backdrop
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.callbacks.onClose();
      }
    });
  }

  public setVisible(visible: boolean) {
    this.overlay.style.display = visible ? 'flex' : 'none';
    if (visible) {
      this.render();
    }
  }

  public setSelectedAgent(agentId: string) {
    this.selectedAgentId = agentId;
    this.render();
  }

  public updateData(agents: Map<string, AgentRuntimeState>, results: TaskResultItem[]) {
    this.currentAgents = agents;
    this.currentResults = results;
    if (this.overlay.style.display !== 'none') {
      this.render();
    }
  }

  private render() {
    this.renderSidebar();
    this.renderMainContent();
  }

  private renderSidebar() {
    this.sidebarList.innerHTML = `
      <div style="padding: 0 6px 6px; font-family: var(--font-title); font-size: 21px; color: #ffffff; letter-spacing: 0.02em;">Detail Agen</div>
    `;

    for (const def of AGENT_DEFS) {
      const isSelected = def.id === this.selectedAgentId;
      const st = this.currentAgents.get(def.id);
      const isWork = st?.act === 'work' || st?.act === 'meet';
      const pct = Math.round(st?.progress || 0);

      const btn = document.createElement('button');
      btn.className = 'agent-tab-item';
      btn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 10px;
        border: 0;
        border-radius: 12px;
        background: ${isSelected ? '#2f4270' : '#1e2b49'};
        color: #ffffff;
        cursor: pointer;
        text-align: left;
        box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25);
        transition: background 0.1s ease;
      `;

      btn.innerHTML = `
        <span style="flex: none; width: 36px; height: 36px; border-radius: 50%; background: ${def.shirt}; color: #0b1220; font-family: var(--font-title); font-size: 17px; display: flex; align-items: center; justify-content: center; border: 2px solid #0b1220;">${def.name[0]}</span>
        <span style="flex: 1; min-width: 0;">
          <span style="display: block; font-family: var(--font-title); font-size: 15px; letter-spacing: 0.02em;">${def.name}</span>
          <span style="display: block; font-size: 11px; color: #9fb0cf;">${def.role}</span>
          <span style="display: block; margin-top: 5px; height: 4px; border-radius: 2px; background: #0f1830; overflow: hidden;">
            <span style="display: block; height: 4px; width: ${isWork ? pct : 0}%; background: #fbbf24; border-radius: 2px; transition: width 0.3s ease;"></span>
          </span>
        </span>
      `;

      btn.addEventListener('click', () => {
        this.selectedAgentId = def.id;
        this.render();
      });

      this.sidebarList.appendChild(btn);
    }
  }

  private renderMainContent() {
    const def = getAgentDef(this.selectedAgentId);
    const st = this.currentAgents.get(this.selectedAgentId);
    const isWork = st?.act === 'work' || st?.act === 'meet';
    const pct = Math.round(st?.progress || 0);

    const bank = TASK_BANK[def.id] || TASK_BANK.bima;
    const taskTitle = isWork ? bank[0][1] : st?.status || def.idle;

    // Filter results for this agent
    const agentResults = this.currentResults.filter((r) => r.id === def.id);
    const hasResults = agentResults.length > 0;

    // Available files list (completed results or mock files from bank)
    const fileList: { key: number; file: string; title: string; sum: string; tag: string; time: string }[] = hasResults
      ? agentResults.map((r) => ({
          key: r.k,
          file: r.file,
          title: r.title,
          sum: r.sum,
          tag: r.tag,
          time: r.time
        }))
      : bank.map((b, idx) => ({
          key: -idx - 1,
          file: b[3],
          title: b[1],
          sum: b[2],
          tag: b[0],
          time: '--:--'
        }));

    const activeKey = this.selectedFileKeys[def.id] ?? fileList[0].key;
    const currentItem = fileList.find((f) => f.key === activeKey) || fileList[0];
    const preview = getOutputFor(def.id, currentItem);

    // Stages: Riset (25%), Kerjakan (50%), Periksa (75%), Kirim (100%)
    const stages = ['Riset', 'Kerjakan', 'Periksa', 'Kirim'].map((name, idx) => {
      const isDone = isWork && pct >= (idx + 1) * 25;
      const isActive = isWork && !isDone && pct >= idx * 25;
      const bg = isDone ? '#34d399' : isActive ? '#fbbf24' : '#243350';
      const fg = isDone || isActive ? '#0b1220' : '#9fb0cf';
      return `<span style="padding: 3px 12px; border-radius: 10px; background: ${bg}; color: ${fg}; font-weight: 600; font-size: 12px;">${name}</span>`;
    });

    const skillChips = def.skills
      .map(
        (s) =>
          `<span style="padding: 2px 10px; border-radius: 10px; background: #243350; color: #cbd5e1; font-size: 12px;">${s}</span>`
      )
      .join(' ');

    const fileTabs = fileList
      .map((f) => {
        const isCur = f.key === currentItem.key;
        return `<button class="file-tab-btn" data-key="${f.key}" style="padding: 6px 14px; border: 0; border-radius: 12px; background: ${isCur ? '#fbbf24' : '#243350'}; color: ${isCur ? '#2b1a00' : '#e8edf7'}; cursor: pointer; font-weight: 600; font-size: 12px; transition: background 0.1s ease;">${f.file}</button>`;
      })
      .join(' ');

    this.mainContent.innerHTML = `
      <!-- Header -->
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="flex: none; width: 64px; height: 64px; border-radius: 50%; background: ${def.shirt}; color: #0b1220; font-family: var(--font-title); font-size: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid #0b1220;">
          ${def.name[0]}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-family: var(--font-title); font-size: 30px; color: #ffffff; letter-spacing: 0.02em; line-height: 1.1;">
            ${def.name} <span style="font-family: var(--font-body); font-weight: 500; font-size: 14px; color: #9fb0cf; letter-spacing: 0;">${def.role}</span>
          </div>
          <div style="font-size: 13px; font-weight: 500; color: #fde68a; margin-top: 3px;">
            ${st?.status || def.idle} · ${st?.where || def.homeRoom}
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
            ${skillChips}
          </div>
        </div>
        <button class="chat-from-detail-btn cartoon-btn btn-yellow" style="flex: none; height: 44px; padding: 0 18px; font-size: 16px;">Chat</button>
        <button class="close-detail-btn" aria-label="Tutup detail agen" style="flex: none; width: 44px; height: 44px; border: 0; border-radius: 12px; background: #243350; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19"></path>
          </svg>
        </button>
      </div>

      <!-- Task Progress Card -->
      <div style="margin-top: 22px; padding: 16px 18px; border-radius: 14px; background: #243350;">
        <div style="display: flex; align-items: baseline; gap: 10px;">
          <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: #9fb0cf;">
            ${isWork ? 'Sedang dikerjakan' : 'Sedang istirahat'}
          </span>
          <span style="margin-left: auto; font-family: var(--font-title); font-size: 20px; color: #fbbf24;">
            ${isWork ? pct + '%' : '-'}
          </span>
        </div>
        <div style="font-weight: 600; font-size: 16px; color: #ffffff; margin-top: 4px;">
          ${taskTitle}
        </div>
        <div style="margin-top: 10px; height: 10px; border-radius: 5px; background: #0f1830; overflow: hidden;">
          <div style="height: 10px; width: ${isWork ? pct : 0}%; border-radius: 5px; background: #fbbf24; transition: width 0.3s ease;"></div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
          ${stages.join('')}
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: #9fb0cf;">
          ${agentResults.length} tugas selesai tercatat
        </div>
      </div>

      <!-- Output Results Section -->
      <div style="margin-top: 22px; display: flex; align-items: baseline; gap: 10px;">
        <div style="font-family: var(--font-title); font-size: 20px; color: #ffffff; letter-spacing: 0.02em;">Hasil Output</div>
        ${!hasResults ? '<div style="font-size: 12px; color: #9fb0cf;">Belum ada hasil, ini contoh output.</div>' : ''}
      </div>
      <div class="file-tabs-bar" style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
        ${fileTabs}
      </div>

      <!-- Output Preview Box -->
      <div style="margin-top: 14px; padding: 18px 20px; border-radius: 14px; background: #16213a;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="padding: 1px 8px; border-radius: 8px; background: ${def.shirt}; color: #0b1220; font-weight: 700; font-size: 10px; letter-spacing: 0.06em;">${currentItem.tag}</span>
          <span style="font-weight: 600; font-size: 15px; color: #ffffff;">${currentItem.title}</span>
          <span style="margin-left: auto; font-size: 11px; color: #8193b3;">${currentItem.file} · ${currentItem.time}</span>
        </div>
        <div style="font-size: 13px; color: #c3d0e6; margin-top: 4px;">${currentItem.sum}</div>

        <div class="preview-content-area" style="margin-top: 14px;">
          ${this.renderPreviewContent(preview)}
        </div>
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #7487a8;">
        Contoh output simulasi. Nanti diisi hasil asli dari agen.
      </div>
    `;

    // Hook listeners
    this.mainContent.querySelector('.close-detail-btn')!.addEventListener('click', () => {
      this.callbacks.onClose();
    });

    this.mainContent.querySelector('.chat-from-detail-btn')!.addEventListener('click', () => {
      this.callbacks.onOpenChat(def.id);
    });

    const fileTabBtns = this.mainContent.querySelectorAll('.file-tab-btn');
    fileTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = Number(btn.getAttribute('data-key'));
        this.selectedFileKeys[def.id] = key;
        this.renderMainContent();
      });
    });
  }

  private renderPreviewContent(preview: OutputPreview): string {
    if (preview.kind === 'code' && preview.code) {
      return `
        <pre style="margin: 0; padding: 14px 16px; border-radius: 10px; background: #0b1220; color: #a7f3d0; font-size: 12px; line-height: 1.6; font-family: ui-monospace, Menlo, Consolas, monospace; white-space: pre-wrap; overflow-x: auto;">${this.escapeHtml(preview.code)}</pre>
      `;
    }

    if (preview.kind === 'doc' && preview.lines) {
      const docLines = preview.lines
        .map(
          (l) =>
            `<div style="font-size: ${l.fs}; font-weight: ${l.fw}; color: ${l.col}; padding-left: ${l.pl}; margin-top: ${l.mt}; font-family: var(--font-body); line-height: 1.5;">${l.t}</div>`
        )
        .join('');
      return `<div style="padding: 4px 4px 8px;">${docLines}</div>`;
    }

    if (preview.kind === 'chart' && preview.bars) {
      const barsHtml = preview.bars
        .map(
          (b) => `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px;">
              <span style="font-size: 12px; font-weight: 600; color: #e2e8f0;">${b.v}</span>
              <div style="width: 100%; max-width: 54px; height: ${b.h}; border-radius: 6px 6px 0 0; background: ${b.bg}; transition: height 0.5s ease;"></div>
              <span style="font-size: 11px; color: #9fb0cf;">${b.n}</span>
            </div>
          `
        )
        .join('');
      return `<div style="display: flex; align-items: flex-end; gap: 14px; height: 170px; padding: 8px 8px 0;">${barsHtml}</div>`;
    }

    if (preview.kind === 'image') {
      return `
        <svg viewBox="0 0 280 360" width="260" height="334" role="img" aria-label="Pratinjau desain" style="display: block; border-radius: 12px; max-width: 100%;">
          <rect width="280" height="360" fill="#1b2742"></rect>
          <circle cx="230" cy="70" r="90" fill="#fbbf24"></circle>
          <circle cx="40" cy="330" r="70" fill="#f472b6"></circle>
          <rect x="24" y="200" width="150" height="10" rx="5" fill="#34d399"></rect>
          <text x="24" y="62" font-family="Lilita One, sans-serif" font-size="30" fill="#ffffff">${preview.imgA || 'PROMO'}</text>
          <text x="24" y="100" font-family="Lilita One, sans-serif" font-size="30" fill="#fde68a">${preview.imgB || 'AKHIR TAHUN'}</text>
          <rect x="24" y="240" width="110" height="34" rx="17" fill="#ffffff"></rect>
          <text x="48" y="262" font-family="Inter, sans-serif" font-weight="700" font-size="14" fill="#1b2742">Lihat promo</text>
        </svg>
      `;
    }

    if (preview.kind === 'palette' && preview.sw) {
      const swatches = preview.sw
        .map(
          (c) => `
            <div style="width: 92px;">
              <div style="height: 70px; border-radius: 10px; background: ${c.c}; border: 2px solid #0b1220;"></div>
              <div style="font-size: 11px; font-weight: 600; color: #e2e8f0; margin-top: 5px;">${c.n}</div>
              <div style="font-size: 10px; color: #9fb0cf;">${c.c}</div>
            </div>
          `
        )
        .join('');
      return `<div style="display: flex; gap: 10px; flex-wrap: wrap;">${swatches}</div>`;
    }

    return '<div style="color: #9fb0cf;">Format pratinjau tidak didukung.</div>';
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
