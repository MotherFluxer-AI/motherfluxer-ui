/**
 * @ai-context: Manages database connections and transactions
 * @ai-dependencies: PostgreSQL pool configuration
 * @ai-critical-points: Must properly release connections and handle transaction rollbacks
 *
 * LEARNING POINTS:
 * 1. Implements connection pooling for efficiency
 * 2. Ensures proper resource cleanup
 */

import { Pool } from 'pg';
import { pool } from './config';
import { QueryResult, PoolClient, QueryResultRow } from 'pg';

class DatabaseClient {
  private static pool: Pool = pool;

  /**
   * @ai-function: Executes a single database query with connection management
   * @ai-requires: Valid SQL query text and optional parameters
   * @ai-affects: Database state and connection pool availability
   */
  static async query<T extends QueryResultRow>(
    text: string, 
    params?: any[]
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /**
   * @ai-function: Manages database transactions with automatic rollback on failure
   * @ai-requires: Valid transaction callback that returns a promise
   * @ai-affects: Database transaction state and connection lifecycle
   */
  static async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getPool() {
    return this.pool;
  }
}

export { DatabaseClient, pool }; 