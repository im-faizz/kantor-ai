export type AgentActionKind = 'report' | 'work' | 'meeting' | 'pool' | 'bil' | 'pantry' | 'lounge';

export interface AgentAction {
  kind: AgentActionKind;
  targetRoom: string;
  targetPos: [number, number];
  act: 'work' | 'meet' | 'bil' | 'pool' | 'coffee' | 'sit' | 'lie';
  statusText: string;
}

export interface TaskEvent {
  agentId: string;
  progress: number;
  stage: 'Riset' | 'Kerjakan' | 'Periksa' | 'Kirim';
  status: string;
  done?: boolean;
  result?: {
    tag: string;
    title: string;
    summary: string;
    file: string;
  };
}

export interface AgentBrain {
  sendMessage(agentId: string, text: string): Promise<{ reply: string; action?: AgentAction }>;
  startTask(agentId: string, instruction: string): AsyncIterable<TaskEvent>;
}
