import { pool } from './config';
import { QueryResult } from 'pg';

export class DatabaseClient {
  static async query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const dbClient = await pool.connect();
    try {
      return await dbClient.query(text, params);
    } finally {
      dbClient.release();
    }
  }

  static async transaction<T>(callback: (dbClient: any) => Promise<T>): Promise<T> {
    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');
      const result = await callback(dbClient);
      await dbClient.query('COMMIT');
      return result;
    } catch (e) {
      await dbClient.query('ROLLBACK');
      throw e;
    } finally {
      dbClient.release();
    }
  }
} 