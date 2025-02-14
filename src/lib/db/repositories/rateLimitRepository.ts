import { DatabaseClient } from '../client';
import { RateLimit } from '../types';

export class RateLimitRepository {
  static async getCurrentWindow(userId: string): Promise<RateLimit | null> {
    const result = await DatabaseClient.query<RateLimit>(
      `SELECT * FROM rate_limits 
       WHERE user_id = $1 
       AND window_start > NOW() - INTERVAL '1 hour'
       ORDER BY window_start DESC 
       LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async createWindow(userId: string): Promise<RateLimit> {
    const result = await DatabaseClient.query<RateLimit>(
      `INSERT INTO rate_limits (
        user_id, window_start, request_count, last_request
      ) VALUES ($1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP)
      RETURNING *`,
      [userId]
    );
    return result.rows[0];
  }

  static async incrementCount(id: string): Promise<void> {
    await DatabaseClient.query(
      `UPDATE rate_limits 
       SET request_count = request_count + 1,
           last_request = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id]
    );
  }
} 