export interface SimulationStartResponse {
  running: true;
  startedAt: string;
  endsAt: string;
  intervalMs: number;
  durationSeconds: number;
}

export interface SimulationCurrentResponse {
  running: boolean;
  startedAt: string | null;
  endsAt: string | null;
  intervalMs: number;
  tickCount: number;
  sentCount: number;
  failureCount: number;
}
