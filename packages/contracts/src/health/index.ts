// ─── Health check contracts ──────────────────────────────────────────────────

export type HealthStatus = 'ok' | 'degraded' | 'error';

export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  services: {
    database: HealthStatus;
    redis?: HealthStatus;
  };
}
