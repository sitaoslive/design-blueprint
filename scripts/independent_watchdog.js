// scripts/independent_watchdog.js
// VET FREEDOM OS — SUPERVISOR INDEPENDIENTE EXTERNO (CAPA C)
// Monitorea n8n y Supabase de forma totalmente desacoplada de los workflows de n8n.

const https = require('https');

class IndependentWatchdog {
  constructor(config = {}) {
    this.organizationId = config.organizationId || '11111111-1111-1111-1111-111111111111';
    this.n8nBaseUrl = config.n8nBaseUrl || 'https://alphavision.app.n8n.cloud';
    this.maxStalenessSeconds = config.maxStalenessSeconds || 300; // 5 minutos
    this.simulatedN8nDown = config.simulatedN8nDown || false;
  }

  // Comprueba si n8n responde HTTP a nivel de red
  async probeN8nNetwork() {
    if (this.simulatedN8nDown) {
      return {
        reachable: false,
        http_status: null,
        latency_ms: 5000,
        error: 'ECONNREFUSED: Connection refused by target (simulated crash)'
      };
    }

    const start = Date.now();
    return new Promise((resolve) => {
      const req = https.get(this.n8nBaseUrl + '/webhook/health/check', { timeout: 8000 }, (res) => {
        const latency = Date.now() - start;
        // Even if webhook responds with 404/200/405, server is alive and reachable
        resolve({
          reachable: true,
          http_status: res.statusCode,
          latency_ms: latency,
          error: null
        });
      });

      req.on('error', (err) => {
        resolve({
          reachable: false,
          http_status: null,
          latency_ms: Date.now() - start,
          error: err.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          reachable: false,
          http_status: null,
          latency_ms: Date.now() - start,
          error: 'ETIMEDOUT: Connection timed out'
        });
      });
    });
  }

  // Evalúa el estado del latido (Heartbeat) y genera reporte diagnóstico
  evaluateWatchdogStatus(networkProbe, lastHeartbeatAt, currentTimestamp = new Date()) {
    const issues = [];
    let isStale = false;
    let stalenessSec = 0;

    if (!lastHeartbeatAt) {
      isStale = true;
      stalenessSec = 999999;
      issues.push('No hay registro histórico de latidos emitidos por n8n');
    } else {
      stalenessSec = Math.floor((currentTimestamp.getTime() - new Date(lastHeartbeatAt).getTime()) / 1000);
      if (stalenessSec > this.maxStalenessSeconds) {
        isStale = true;
        issues.push(`Latido de n8n vencido: ${stalenessSec} segundos sin reporte (umbral: ${this.maxStalenessSeconds}s)`);
      }
    }

    if (!networkProbe.reachable) {
      issues.push(`Instancia n8n inalcanzable por red: ${networkProbe.error}`);
    }

    const isHealthy = networkProbe.reachable && !isStale;
    const severity = !networkProbe.reachable ? 'P0' : (isStale ? 'P0' : 'P3');

    return {
      watchdog_evaluated_at: currentTimestamp.toISOString(),
      organization_id: this.organizationId,
      n8n_base_url: this.n8nBaseUrl,
      is_healthy: isHealthy,
      n8n_reachable: networkProbe.reachable,
      http_status: networkProbe.http_status,
      network_latency_ms: networkProbe.latency_ms,
      heartbeat_staleness_seconds: stalenessSec,
      is_heartbeat_stale: isStale,
      issues_detected: issues,
      severity: severity,
      escalation_action: isHealthy ? 'NONE' : 'DIRECTOR_P0_INCIDENT',
      incident_payload: isHealthy ? null : {
        organization_id: this.organizationId,
        idempotency_key: `WATCHDOG-N8N-${currentTimestamp.toISOString().substring(0, 13)}`,
        incident_code: !networkProbe.reachable ? 'N8N_UNREACHABLE' : 'N8N_HEARTBEAT_EXPIRED',
        error_category: 'SERVICE_UNAVAILABLE',
        severity: 'P0',
        title: !networkProbe.reachable ? 'Alerta Crítica: n8n Cloud no responde por red' : 'Alerta Crítica: Latido n8n expirado',
        description: issues.join('; '),
        responsible_role: 'DIRECTOR',
        status: 'OPEN',
        recovery_strategy: 'MANUAL_INTERVENTION'
      }
    };
  }
}

module.exports = { IndependentWatchdog };
