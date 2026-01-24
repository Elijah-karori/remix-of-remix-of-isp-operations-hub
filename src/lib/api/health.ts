import { API_BASE_URL } from './base';

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "checking";
  latency?: number;
  timestamp?: string;
  error?: string;
}

export const healthApi = {
  check: async (): Promise<HealthStatus> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (response.ok) {
        return {
          status: "healthy",
          latency,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          status: "unhealthy",
          latency,
          timestamp: new Date().toISOString(),
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return {
        status: "unhealthy",
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  },

  ping: async (): Promise<{ reachable: boolean; latency: number }> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/`, {
        method: "get",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return { reachable: true, latency: Date.now() - startTime };
    } catch {
      return { reachable: false, latency: Date.now() - startTime };
    }
  },
};
