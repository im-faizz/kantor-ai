import { AGENT_DEFS, AgentDef, ActivityType, INITIAL_ACTIVITIES, INITIAL_PROGRESS } from '../data/agents';
import { TASK_BANK, WORK_RANDOM_LINES, MEETING_RANDOM_LINES, REST_RANDOM_LINES } from '../data/tasks';
import { CHATTER_INITIATIVE, CHATTER_RESPONSE } from '../data/dialogs';
import { AgentSpriteView, createAgentTextures } from './agent-sprite';
import { findRoute, getRoomOf } from '../world/route';
import { getRoomDef } from '../world/route';
import { MockBrain } from '../brain/MockBrain';
import { Container } from 'pixi.js';

export interface AgentRuntimeState {
  x: number;
  y: number;
  status: string;
  where: string;
  act: ActivityType;
  moving: boolean;
  dur: number;
  progress: number;
}

export interface TaskResultItem {
  k: number;
  id: string;
  tag: string;
  title: string;
  sum: string;
  file: string;
  time: string;
}

export class AgentManager {
  public agents: Map<string, AgentRuntimeState> = new Map();
  public views: Map<string, AgentSpriteView> = new Map();
  public brain: MockBrain;

  public results: TaskResultItem[] = [];
  public chats: Record<string, { mine: boolean; text: string }[]> = {};
  public selectedAgentId: string | null = null;

  private taskIndices: Record<string, number> = {};
  private moveTokens: Record<string, number> = {};
  private resultCounter: number = 0;

  private chatterTimer: number = 0;
  private workRandomTimer: number = 0;
  private progTimer: number = 0;

  public onStateChanged?: () => void;
  public onAgentClicked?: (id: string) => void;

  constructor(parentContainer: Container) {
    // Initialize brain with state accessor
    this.brain = new MockBrain(() => {
      const states: Record<string, { status: string; where: string; act: string }> = {};
      this.agents.forEach((st, id) => {
        states[id] = { status: st.status, where: st.where, act: st.act };
      });
      return states;
    });

    // Initialize all 8 agents
    for (const def of AGENT_DEFS) {
      const act = INITIAL_ACTIVITIES[def.id] || 'work';
      const prog = INITIAL_PROGRESS[def.id] || 0;

      const state: AgentRuntimeState = {
        x: def.home[0],
        y: def.home[1],
        status: def.idle,
        where: def.homeRoom,
        act: act,
        moving: false,
        dur: 1,
        progress: prog
      };
      this.agents.set(def.id, state);

      // Create textures once per agent
      const textures = createAgentTextures(def);
      const view = new AgentSpriteView(def, textures);
      view.updatePosition(state.x, state.y);
      view.setAct(state.act, state.moving);

      // Click handler
      view.container.on('pointerdown', () => {
        if (this.onAgentClicked) {
          this.onAgentClicked(def.id);
        }
      });

      parentContainer.addChild(view.container);
      this.views.set(def.id, view);
    }
  }

  public getAgentState(id: string): AgentRuntimeState | undefined {
    return this.agents.get(id);
  }

  public selectAgent(id: string | null) {
    this.selectedAgentId = id;
    this.views.forEach((v, agentId) => {
      v.setSelected(agentId === id);
    });
  }

  public say(agentId: string, text: string, durationMs: number = 3200) {
    const view = this.views.get(agentId);
    if (!view) return;

    view.showBubble(text);
    setTimeout(() => {
      if (view.currentText === text) {
        view.hideBubble();
      }
    }, durationMs);
  }

  public walkTo(agentId: string, targetX: number, targetY: number, arrivalAct: ActivityType) {
    const state = this.agents.get(agentId);
    const view = this.views.get(agentId);
    if (!state || !view) return;

    const waypoints = findRoute(state.x, state.y, targetX, targetY);
    const tok = (this.moveTokens[agentId] || 0) + 1;
    this.moveTokens[agentId] = tok;

    const walkStep = (stepIdx: number) => {
      if (this.moveTokens[agentId] !== tok) return;

      if (stepIdx >= waypoints.length) {
        state.moving = false;
        state.act = arrivalAct;
        const roomDef = getRoomDef(getRoomOf(state.x, state.y));
        if (roomDef) state.where = roomDef.name;

        view.setAct(arrivalAct, false);
        view.updateBadge(state.status);
        if (this.onStateChanged) this.onStateChanged();
        return;
      }

      const p = waypoints[stepIdx];
      const dist = Math.hypot(p[0] - state.x, p[1] - state.y);
      const speed = 120; // 120 units per second as specified
      const durSec = Math.max(0.15, dist / speed);

      state.moving = true;
      view.setAct('walk', true);

      const startTime = performance.now();
      const startX = state.x;
      const startY = state.y;

      const animateSegment = (now: number) => {
        if (this.moveTokens[agentId] !== tok) return;
        const elapsed = (now - startTime) / 1000;
        const frac = Math.min(1, elapsed / durSec);

        state.x = startX + (p[0] - startX) * frac;
        state.y = startY + (p[1] - startY) * frac;
        view.updatePosition(state.x, state.y);

        if (frac < 1) {
          requestAnimationFrame(animateSegment);
        } else {
          state.x = p[0];
          state.y = p[1];
          view.updatePosition(state.x, state.y);
          walkStep(stepIdx + 1);
        }
      };

      requestAnimationFrame(animateSegment);
    };

    walkStep(0);
  }

  public addResult(agentId: string, template: [string, string, string, string]) {
    this.resultCounter++;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const item: TaskResultItem = {
      k: this.resultCounter,
      id: agentId,
      tag: template[0],
      title: template[1],
      sum: template[2],
      file: template[3],
      time: timeStr
    };

    this.results.unshift(item);
    if (this.results.length > 30) this.results.pop();

    const state = this.agents.get(agentId);
    const view = this.views.get(agentId);
    if (state && view) {
      state.status = `Selesai: ${template[1]}`;
      view.updateBadge(state.status);
      this.say(agentId, `Selesai! ${template[1]}`, 3200);
    }

    if (this.onStateChanged) this.onStateChanged();
  }

  public async sendUserMessage(agentId: string, text: string) {
    text = text.trim();
    if (!text) return;

    if (!this.chats[agentId]) {
      const def = AGENT_DEFS.find((a) => a.id === agentId)!;
      this.chats[agentId] = [{ mine: false, text: def.intro }];
    }

    this.chats[agentId].push({ mine: true, text });
    if (this.onStateChanged) this.onStateChanged();

    // Small response delay for natural feel
    setTimeout(async () => {
      const res = await this.brain.sendMessage(agentId, text);
      this.chats[agentId].push({ mine: false, text: res.reply });
      this.say(agentId, res.reply, 3500);

      const state = this.agents.get(agentId);
      const view = this.views.get(agentId);

      if (res.action && state && view) {
        state.status = res.action.statusText;
        view.updateBadge(state.status);
        this.walkTo(agentId, res.action.targetPos[0], res.action.targetPos[1], res.action.act as ActivityType);

        if (res.action.kind === 'work') {
          // Schedule completed task after ~9 seconds
          setTimeout(() => {
            const def = AGENT_DEFS.find((a) => a.id === agentId)!;
            const tag = TASK_BANK[agentId]?.[0]?.[0] || 'TUGAS';
            const slug =
              text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 20) || 'hasil';

            this.addResult(agentId, [
              tag,
              `${def.verbCap}: ${text.slice(0, 26)}`,
              'Selesai sesuai instruksimu',
              `${slug}.md`
            ]);
          }, 9000);
        }
      }

      if (this.onStateChanged) this.onStateChanged();
    }, 450);
  }

  private chatterTick() {
    // Find rooms with 2+ agents that are not moving and not speaking
    const byRoom: Record<string, AgentDef[]> = {};
    for (const def of AGENT_DEFS) {
      const st = this.agents.get(def.id)!;
      const vw = this.views.get(def.id)!;
      if (st.moving || vw.currentText) continue;

      const r = getRoomOf(st.x, st.y);
      if (!byRoom[r]) byRoom[r] = [];
      byRoom[r].push(def);
    }

    const eligibleRooms = Object.keys(byRoom).filter((k) => byRoom[k].length >= 2);
    if (eligibleRooms.length === 0) return;

    const rKey = eligibleRooms[Math.floor(Math.random() * eligibleRooms.length)];
    const list = byRoom[rKey];
    const i = Math.floor(Math.random() * list.length);
    let j = Math.floor(Math.random() * (list.length - 1));
    if (j >= i) j++;

    const agentA = list[i];
    const agentB = list[j];
    const actA = this.agents.get(agentA.id)!.act;
    const actB = this.agents.get(agentB.id)!.act;

    const linesA = CHATTER_INITIATIVE[actA] || CHATTER_INITIATIVE.work;
    const linesB = CHATTER_RESPONSE[actB] || CHATTER_RESPONSE.work;

    const lineA = linesA[Math.floor(Math.random() * linesA.length)].replace('{n}', agentB.name);
    const lineB = linesB[Math.floor(Math.random() * linesB.length)];

    this.say(agentA.id, lineA, 3300);
    setTimeout(() => {
      const stB = this.agents.get(agentB.id);
      if (stB && !stB.moving) {
        this.say(agentB.id, lineB, 3000);
      }
    }, 1900);
  }

  private workTick() {
    const cand = AGENT_DEFS.filter((d) => !this.agents.get(d.id)!.moving);
    if (cand.length === 0) return;

    const def = cand[Math.floor(Math.random() * cand.length)];
    const st = this.agents.get(def.id)!;
    const vw = this.views.get(def.id)!;

    let line = '';
    if (st.act === 'work') {
      const lines = WORK_RANDOM_LINES[def.id] || WORK_RANDOM_LINES.bima;
      line = lines[Math.floor(Math.random() * lines.length)];
      st.status = line;
      vw.updateBadge(line);
      if (this.onStateChanged) this.onStateChanged();
    } else if (st.act === 'meet') {
      line = MEETING_RANDOM_LINES[Math.floor(Math.random() * MEETING_RANDOM_LINES.length)];
      st.status = line;
      vw.updateBadge(line);
      if (this.onStateChanged) this.onStateChanged();
    }
  }

  private progressTick() {
    const doneAgents: string[] = [];

    this.agents.forEach((st, id) => {
      if (st.moving) return;

      if (st.act === 'work' || st.act === 'meet') {
        // Gain 1.5% to 4.0%
        st.progress += 1.5 + Math.random() * 2.5;
        if (st.progress >= 100) {
          st.progress = 0;
          doneAgents.push(id);
        }
      } else {
        st.progress = 0;
      }
    });

    for (const id of doneAgents) {
      const bank = TASK_BANK[id] || TASK_BANK.bima;
      const idx = (this.taskIndices[id] || 0) % bank.length;
      this.taskIndices[id] = idx + 1;
      this.addResult(id, bank[idx]);
    }

    if (this.onStateChanged) this.onStateChanged();
  }

  public update(deltaTime: number) {
    // Update all views
    this.views.forEach((v) => v.update(deltaTime));

    // Periodic simulation timers
    this.chatterTimer += deltaTime;
    if (this.chatterTimer >= 4.5) {
      this.chatterTimer = 0;
      this.chatterTick();
    }

    this.workRandomTimer += deltaTime;
    if (this.workRandomTimer >= 3.8) {
      this.workRandomTimer = 0;
      this.workTick();
    }

    this.progTimer += deltaTime;
    if (this.progTimer >= 1.0) {
      this.progTimer = 0;
      this.progressTick();
    }
  }
}
