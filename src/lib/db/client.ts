/**
 * @ai-context: Manages database connections and transactions
 * @ai-dependencies: PostgreSQL pool configuration
 * @ai-critical-points: Must properly release connections and handle transaction rollbacks
 *
 * LEARNING POINTS:
 * 1. Implements connection pooling for efficiency
 * 2. Ensures proper resource cleanup
 */

import { pool } from './config';
import { QueryResult, PoolClient } from 'pg';

export class DatabaseClient {
  /**
   * @ai-function: Executes a single database query with connection management
   * @ai-requires: Valid SQL query text and optional parameters
   * @ai-affects: Database state and connection pool availability
   */
  static async query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const dbClient = await pool.connect();
    try {
      return await dbClient.query(text, params);
    } finally {
      dbClient.release();
    }
  }

  /**
   * @ai-function: Manages database transactions with automatic rollback on failure
   * @ai-requires: Valid transaction callback that returns a promise
   * @ai-affects: Database transaction state and connection lifecycle
   */
  static async transaction<T>(callback: (dbClient: PoolClient) => Promise<T>): Promise<T> {
    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');
      const result = await callback(dbClient);
      await dbClient.query('COMMIT');
      return result;
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }
} 