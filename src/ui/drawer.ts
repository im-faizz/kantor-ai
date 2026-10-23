import { AGENT_DEFS, AgentDef, getAgentDef } from '../data/agents';
import { AgentRuntimeState } from '../agents/agent-manager';

export interface DrawerCallbacks {
  onClose: () => void;
  onSelectAgent: (agentId: string) => void;
  onSendMessage: (agentId: string, text: string) => void;
}

export class Drawer {
  public container: HTMLElement;
  private mode: 'list' | 'chat' = 'list';
  private selectedAgentId: string | null = null;
  private callbacks: DrawerCallbacks;

  private listContainer: HTMLElement;
  private chatContainer: HTMLElement;

  private chatHeaderInitial: HTMLElement;
  private chatHeaderName: HTMLElement;
  private chatHeaderRole: HTMLElement;
  private chatHeaderStatus: HTMLElement;
  private chatMessagesList: HTMLElement;
  private chatInput: HTMLInputElement;
  private chatSendBtn: HTMLButtonElement;
  private chipsContainer: HTMLElement;

  constructor(callbacks: DrawerCallbacks) {
    this.callbacks = callbacks;

    this.container = document.createElement('div');
    this.container.className = 'mobile-sheet';
    this.container.style.cssText = `
      position: absolute;
      right: 24px;
      top: 92px;
      bottom: 32px;
      width: 380px;
      display: none;
      flex-direction: column;
      background: var(--color-panel);
      border: 3px solid var(--color-border);
      border-radius: 18px;
      box-shadow: var(--shadow-drawer);
      overflow: hidden;
      z-index: 30;
      animation: fadeIn 0.15s ease-out;
    `;

    // 1. List View
    this.listContainer = document.createElement('div');
    this.listContainer.style.cssText = 'display: flex; flex-direction: column; flex: 1; min-height: 0;';
    this.listContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px 18px;">
        <div style="font-family: var(--font-title); font-size: 22px; color: #ffffff; letter-spacing: 0.02em;">Tim Karyawan AI</div>
        <button class="close-btn" aria-label="Tutup panel" style="width: 36px; height: 36px; border: 0; border-radius: 10px; background: #243350; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19"></path>
          </svg>
        </button>
      </div>
      <div style="padding: 0 18px 10px; font-size: 12px; color: #9fb0cf;">Ketuk agen untuk mengobrol dan memberi instruksi.</div>
      <div class="agent-cards-list" style="flex: 1; min-height: 0; overflow-y: auto; padding: 0 14px 14px; display: flex; flex-direction: column; gap: 8px;"></div>
    `;

    this.listContainer.querySelector('.close-btn')!.addEventListener('click', () => {
      this.callbacks.onClose();
    });

    // 2. Chat View
    this.chatContainer = document.createElement('div');
    this.chatContainer.style.cssText = 'display: none; flex-direction: column; flex: 1; min-height: 0;';
    this.chatContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #243350;">
        <button class="back-btn" aria-label="Kembali ke daftar tim" style="flex: none; width: 36px; height: 36px; border: 0; border-radius: 10px; background: #1b2742; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7"></path>
          </svg>
        </button>
        <div class="chat-initial" style="flex: none; width: 40px; height: 40px; border-radius: 50%; background: #fbbf24; color: #0b1220; font-family: var(--font-title); font-size: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid #0b1220;">B</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-family: var(--font-title); font-size: 19px; color: #ffffff; letter-spacing: 0.02em;">
            <span class="chat-name">Bima</span> <span class="chat-role" style="font-family: var(--font-body); font-size: 12px; font-weight: 500; color: #9fb0cf;">Manager Proyek</span>
          </div>
          <div class="chat-status" style="font-size: 12px; font-weight: 500; color: #fde68a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Meninjau laporan · Ruang Manager</div>
        </div>
        <button class="chat-close-btn" aria-label="Tutup panel" style="flex: none; width: 36px; height: 36px; border: 0; border-radius: 10px; background: #1b2742; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19"></path>
          </svg>
        </button>
      </div>
      <div style="padding: 6px 14px; background: #162036; font-size: 11px; color: #9fb0cf;">
        Mode demo: balasan agen disimulasikan. Coba "rapat di ruang meeting", "main bilyard", atau "mulai kerja".
      </div>
      <div class="chat-messages" style="flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 12px 14px;"></div>
      <div class="chat-chips" style="display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px 0;"></div>
      <div style="display: flex; gap: 8px; padding: 10px 14px 14px;">
        <input class="chat-input" aria-label="Tulis instruksi untuk agen" placeholder="Tulis instruksi untuk agen..." style="flex: 1; min-width: 0; padding: 11px 14px; border: 2px solid #0b1220; border-radius: 12px; background: #0f1830; color: #ffffff; font-family: var(--font-body); font-size: 14px; outline: none;" />
        <button class="chat-send-btn cartoon-btn btn-yellow" aria-label="Kirim pesan" style="flex: none; width: 46px; height: 44px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b2300" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 12l16-8-6 16-3-7-7-1z"></path>
          </svg>
        </button>
      </div>
    `;

    this.chatHeaderInitial = this.chatContainer.querySelector('.chat-initial') as HTMLElement;
    this.chatHeaderName = this.chatContainer.querySelector('.chat-name') as HTMLElement;
    this.chatHeaderRole = this.chatContainer.querySelector('.chat-role') as HTMLElement;
    this.chatHeaderStatus = this.chatContainer.querySelector('.chat-status') as HTMLElement;
    this.chatMessagesList = this.chatContainer.querySelector('.chat-messages') as HTMLElement;
    this.chatInput = this.chatContainer.querySelector('.chat-input') as HTMLInputElement;
    this.chatSendBtn = this.chatContainer.querySelector('.chat-send-btn') as HTMLButtonElement;
    this.chipsContainer = this.chatContainer.querySelector('.chat-chips') as HTMLElement;

    // Events
    this.chatContainer.querySelector('.back-btn')!.addEventListener('click', () => {
      this.showList();
    });
    this.chatContainer.querySelector('.chat-close-btn')!.addEventListener('click', () => {
      this.callbacks.onClose();
    });

    const sendAction = () => {
      const text = this.chatInput.value.trim();
      if (!text || !this.selectedAgentId) return;
      this.callbacks.onSendMessage(this.selectedAgentId, text);
      this.chatInput.value = '';
    };

    this.chatSendBtn.addEventListener('click', sendAction);
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendAction();
      }
    });

    // Suggestion chips
    const chipTexts = [
      'Mulai kerja',
      'Rapat di ruang meeting',
      'Main bilyard',
      'Ngopi di pantry',
      'Berenang',
      'Laporan status'
    ];

    for (const chip of chipTexts) {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 5px 11px;
        border: 2px solid #fbbf24;
        border-radius: 14px;
        background: transparent;
        color: #fde68a;
        cursor: pointer;
        font-family: var(--font-body);
        font-weight: 500;
        font-size: 12px;
        transition: background 0.1s ease;
      `;
      btn.textContent = chip;
      btn.addEventListener('click', () => {
        if (!this.selectedAgentId) return;
        this.callbacks.onSendMessage(this.selectedAgentId, chip);
      });
      this.chipsContainer.appendChild(btn);
    }

    this.container.appendChild(this.listContainer);
    this.container.appendChild(this.chatContainer);
  }

  public setVisible(visible: boolean) {
    this.container.style.display = visible ? 'flex' : 'none';
  }

  public showList() {
    this.mode = 'list';
    this.selectedAgentId = null;
    this.listContainer.style.display = 'flex';
    this.chatContainer.style.display = 'none';
  }

  public showChat(agentId: string) {
    this.mode = 'chat';
    this.selectedAgentId = agentId;
    this.listContainer.style.display = 'none';
    this.chatContainer.style.display = 'flex';
    this.chatInput.focus();
  }

  public getSelectedAgentId(): string | null {
    return this.selectedAgentId;
  }

  public isChatOpen(): boolean {
    return this.mode === 'chat' && this.container.style.display !== 'none';
  }

  public updateAgents(agents: Map<string, AgentRuntimeState>) {
    const listElem = this.listContainer.querySelector('.agent-cards-list') as HTMLElement;
    listElem.innerHTML = '';

    for (const def of AGENT_DEFS) {
      const st = agents.get(def.id);
      const statusText = st?.status || def.idle;
      const whereText = st?.where || def.homeRoom;

      const card = document.createElement('button');
      card.style.cssText = `
        display: flex;
        gap: 12px;
        align-items: center;
        width: 100%;
        text-align: left;
        padding: 10px 12px;
        border: 0;
        border-radius: 14px;
        background: #243350;
        cursor: pointer;
        color: #ffffff;
        font-family: var(--font-body);
        box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25);
        transition: transform 0.08s ease;
      `;

      // Avatar circle
      const avatarHtml = `
        <div style="flex: none; width: 44px; height: 44px; border-radius: 12px; background: #fff4dc; overflow: hidden; border: 2px solid ${def.shirt}; display: flex; align-items: center; justify-content: center;">
          <span style="font-family: var(--font-title); font-size: 20px; color: #0b1220;">${def.name[0]}</span>
        </div>
      `;

      // Skill chips
      const skillChips = def.skills
        .map(
          (sk) =>
            `<span style="padding: 1px 8px; border-radius: 10px; background: #1b2742; color: #cbd5e1; font-size: 11px;">${sk}</span>`
        )
        .join(' ');

      card.innerHTML = `
        ${avatarHtml}
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-family: var(--font-title); font-size: 17px; letter-spacing: 0.02em;">${def.name}</span>
            <span style="font-size: 12px; font-weight: 500; color: #9fb0cf;">${def.role}</span>
          </div>
          <div style="font-size: 12px; font-weight: 500; color: #fde68a; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${statusText} · ${whereText}
          </div>
          <div style="display: flex; gap: 5px; margin-top: 6px; flex-wrap: wrap;">
            ${skillChips}
          </div>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none;">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z"></path>
        </svg>
      `;

      card.addEventListener('click', () => {
        this.callbacks.onSelectAgent(def.id);
      });

      listElem.appendChild(card);
    }

    // Update active chat header if open
    if (this.selectedAgentId) {
      const def = getAgentDef(this.selectedAgentId);
      const st = agents.get(this.selectedAgentId);
      this.chatHeaderInitial.textContent = def.name[0];
      this.chatHeaderInitial.style.background = def.shirt;
      this.chatHeaderName.textContent = def.name;
      this.chatHeaderRole.textContent = def.role;
      this.chatHeaderStatus.textContent = `${st?.status || def.idle} · ${st?.where || def.homeRoom}`;
    }
  }

  public updateMessages(messages: { mine: boolean; text: string }[]) {
    this.chatMessagesList.innerHTML = '';

    for (const msg of messages) {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: ${msg.mine ? 'flex-end' : 'flex-start'};
        width: 100%;
      `;

      const bubble = document.createElement('div');
      bubble.style.cssText = `
        max-width: 82%;
        padding: 8px 12px;
        border-radius: 14px;
        background: ${msg.mine ? '#fbbf24' : '#243350'};
        color: ${msg.mine ? '#2b1a00' : '#e8edf7'};
        font-size: 14px;
        line-height: 1.4;
        word-break: break-word;
      `;
      bubble.textContent = msg.text;

      row.appendChild(bubble);
      this.chatMessagesList.appendChild(row);
    }

    // Auto-scroll to bottom
    this.chatMessagesList.scrollTop = this.chatMessagesList.scrollHeight;
  }
}
