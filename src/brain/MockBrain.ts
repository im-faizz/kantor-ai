import { AgentBrain, AgentAction, TaskEvent } from './types';
import { getAgentDef, AGENT_DEFS, ACTIVITY_SPOTS } from '../data/agents';
import { TASK_BANK } from '../data/tasks';

export class MockBrain implements AgentBrain {
  private agentStates: () => Record<string, { status: string; where: string; act: string }>;

  constructor(getStateAccessor?: () => Record<string, { status: string; where: string; act: string }>) {
    this.agentStates = getStateAccessor || (() => ({}));
  }

  private parseIntent(text: string): 'report' | 'meeting' | 'pool' | 'bil' | 'pantry' | 'lounge' | 'work' {
    const t = text.toLowerCase();
    if (/laporan|status|progres|sedang apa|lagi apa/.test(t)) return 'report';
    if (/rapat|meeting|diskusi/.test(t)) return 'meeting';
    if (/renang|kolam/.test(t)) return 'pool';
    if (/bilyard|biliar|billiard/.test(t)) return 'bil';
    if (/kopi|ngopi|pantry|makan|minum/.test(t)) return 'pantry';
    if (/santai|istirahat|break|rehat/.test(t)) return 'lounge';
    return 'work';
  }

  private truncate(text: string, maxLen: number): string {
    const t = text.trim().replace(/\s+/g, ' ');
    return t.length > maxLen ? t.slice(0, maxLen - 1) + '…' : t;
  }

  async sendMessage(agentId: string, text: string): Promise<{ reply: string; action?: AgentAction }> {
    const def = getAgentDef(agentId);
    const intent = this.parseIntent(text);
    const agentIdx = AGENT_DEFS.findIndex((a) => a.id === agentId);

    if (intent === 'report') {
      const states = this.agentStates();
      const current = states[agentId];
      const status = current?.status || def.idle;
      const where = current?.where || def.homeRoom;
      return {
        reply: `Saat ini: ${status}. Posisi saya di ${where}.`
      };
    }

    if (intent === 'work') {
      const shortDesc = this.truncate(text, 24);
      return {
        reply: `Siap! Saya mulai ${def.verb}: "${shortDesc}".`,
        action: {
          kind: 'work',
          targetRoom: def.deskRoom,
          targetPos: def.desk,
          act: 'work',
          statusText: this.truncate(`${def.verbCap}: ${shortDesc}`, 30)
        }
      };
    }

    const spotMap = ACTIVITY_SPOTS[intent];
    const spot = spotMap[agentIdx % spotMap.length];

    const responses: Record<string, { reply: string; status: string; room: string }> = {
      meeting: {
        reply: 'Siap, saya ke Ruang Meeting sekarang.',
        status: 'Menuju rapat',
        room: 'Ruang Meeting'
      },
      pool: {
        reply: 'Asik, ke kolam renang dulu ya.',
        status: 'Berenang',
        room: 'Kolam Renang'
      },
      bil: {
        reply: 'Oke, main bilyard sebentar.',
        status: 'Main bilyard',
        room: 'Ruang Santai'
      },
      pantry: {
        reply: 'Ngopi dulu di pantry ya.',
        status: 'Ngopi',
        room: 'Pantry'
      },
      lounge: {
        reply: 'Oke, istirahat di ruang santai.',
        status: 'Istirahat',
        room: 'Ruang Santai'
      }
    };

    const resp = responses[intent];
    const spotIdx = agentIdx % spotMap.length;
    let act: 'meet' | 'pool' | 'bil' | 'coffee' | 'sit' | 'lie' = 'sit';

    if (intent === 'meeting') act = 'meet';
    else if (intent === 'pool') act = 'pool';
    else if (intent === 'bil') act = 'bil';
    else if (intent === 'pantry') act = 'coffee';
    else if (intent === 'lounge') act = spotIdx >= 6 || spotIdx % 2 !== 0 ? 'lie' : 'sit';

    return {
      reply: resp.reply,
      action: {
        kind: intent,
        targetRoom: resp.room,
        targetPos: spot,
        act: act,
        statusText: resp.status
      }
    };
  }

  async *startTask(agentId: string, instruction: string): AsyncIterable<TaskEvent> {
    const def = getAgentDef(agentId);
    const stages: Array<'Riset' | 'Kerjakan' | 'Periksa' | 'Kirim'> = [
      'Riset',
      'Kerjakan',
      'Periksa',
      'Kirim'
    ];

    let progress = 0;
    while (progress < 100) {
      await new Promise((res) => setTimeout(res, 800));
      progress = Math.min(100, progress + 25);
      const stageIdx = Math.min(3, Math.floor(progress / 25));
      const currentStage = stages[stageIdx];

      yield {
        agentId,
        progress,
        stage: currentStage,
        status: `${currentStage} tugas: ${this.truncate(instruction, 20)}`,
        done: progress >= 100
      };
    }

    const bank = TASK_BANK[agentId] || TASK_BANK['bima'];
    const template = bank[0];
    const slug =
      instruction
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 20) || 'hasil';

    yield {
      agentId,
      progress: 100,
      stage: 'Kirim',
      status: `Selesai: ${this.truncate(instruction, 24)}`,
      done: true,
      result: {
        tag: template[0],
        title: `${def.verbCap}: ${this.truncate(instruction, 26)}`,
        summary: 'Selesai sesuai instruksimu',
        file: `${slug}.md`
      }
    };
  }
}
