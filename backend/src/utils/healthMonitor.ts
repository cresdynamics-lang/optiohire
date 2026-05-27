import { query } from '../db/index.js';
import { logger } from './logger.js';

export type ComponentStatus = 'running' | 'error' | 'stopped' | 'idle';

export class HealthMonitorService {
  /**
   * Update the health status of a specific system component.
   */
  async updateStatus(
    key: string,
    status: ComponentStatus,
    error?: string | null,
    metadata: any = {}
  ) {
    try {
      const isError = status === 'error';
      
      // Update current status
      await query(
        `INSERT INTO system_health (component_key, status, last_run_at, last_error, error_count, metadata, updated_at)
         VALUES ($1, $2, NOW(), $3, CASE WHEN $4 = true THEN 1 ELSE 0 END, $5, NOW())
         ON CONFLICT (component_key) DO UPDATE SET
           status = EXCLUDED.status,
           last_run_at = EXCLUDED.last_run_at,
           last_error = CASE WHEN EXCLUDED.status = 'error' THEN EXCLUDED.last_error ELSE system_health.last_error END,
           error_count = CASE WHEN EXCLUDED.status = 'error' THEN system_health.error_count + 1 ELSE 0 END,
           metadata = system_health.metadata || EXCLUDED.metadata,
           updated_at = NOW()`,
        [key, status, error || null, isError, JSON.stringify(metadata)]
      );

      // Update history (increment success or error count for today)
      await query(
        `INSERT INTO system_health_history (component_key, check_date, success_count, error_count)
         VALUES ($1, CURRENT_DATE, $2, $3)
         ON CONFLICT (component_key, check_date) DO UPDATE SET
           success_count = system_health_history.success_count + EXCLUDED.success_count,
           error_count = system_health_history.error_count + EXCLUDED.error_count`,
        [key, isError ? 0 : 1, isError ? 1 : 0]
      );

    } catch (err) {
      logger.error(`[HealthMonitor] Failed to update status for ${key}:`, err);
    }
  }

  /**
   * Get the current status of all components.
   */
  async getFullHealth() {
    const { rows: status } = await query(
      'SELECT component_key, status, last_run_at, last_error, error_count, metadata, updated_at FROM system_health ORDER BY component_key ASC'
    );

    const { rows: history } = await query(
      `SELECT component_key, 
              check_date, 
              success_count, 
              error_count,
              ROUND((success_count::float / NULLIF(success_count + error_count, 0)) * 100) as uptime_pct
       FROM system_health_history 
       WHERE check_date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY check_date DESC`
    );

    return {
      current: status,
      history: history
    };
  }
}

export const healthMonitor = new HealthMonitorService();
