import { AgentBrain, AgentAction, TaskEvent } from './types';

/**
 * ClaudeBrain: Kerangka penghubung ke Claude API (Fase 2).
 *
 * RENCANA FASE 2:
 * 1. Backend server Node kecil (Hono atau Express) yang memegang ANTHROPIC_API_KEY dari environment.
 * 2. Frontend TIDAK PERNAH memegang API key.
 * 3. Satu system prompt terstruktur per peran agen (Bima, Sari, Dika, Maya, Raka, Tari, Joko, Lina).
 * 4. Bima berperan sebagai manager proyek yang memecah tugas pengguna dan mendelegasikan ke agen spesialis.
 * 5. Progres pengerjaan dikirim secara real-time via Server-Sent Events (SSE).
 * 6. Format hasil output terstruktur: kode (Dika), dokumen terstruktur (Bima, Sari, Raka, Joko, Lina),
 *    data statistik/grafik (Tari), dan desain SVG / palet warna (Maya).
 */
export class ClaudeBrain implements AgentBrain {
  private apiEndpoint: string;

  constructor(apiEndpoint = '/api/agents') {
    this.apiEndpoint = apiEndpoint;
  }

  async sendMessage(agentId: string, text: string): Promise<{ reply: string; action?: AgentAction }> {
    // TODO (Fase 2):
    // const response = await fetch(`${this.apiEndpoint}/chat`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ agentId, message: text })
    // });
    // const data = await response.json();
    // return { reply: data.reply, action: data.action };

    throw new Error(
      `ClaudeBrain belum diaktifkan (Fase 1 menggunakan MockBrain). Target agent: ${agentId}, input: "${text}"`
    );
  }

  async *startTask(agentId: string, instruction: string): AsyncIterable<TaskEvent> {
    // TODO (Fase 2):
    // const eventSource = new EventSource(`${this.apiEndpoint}/tasks/stream?agentId=${agentId}&instruction=${encodeURIComponent(instruction)}`);
    // for await (const event of parseSSE(eventSource)) {
    //   yield event as TaskEvent;
    // }

    throw new Error(
      `ClaudeBrain belum diaktifkan (Fase 1 menggunakan MockBrain). Target agent: ${agentId}, task: "${instruction}"`
    );
  }
}
