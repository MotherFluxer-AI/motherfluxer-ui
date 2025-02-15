import { DatabaseClient, pool } from '@/lib/db/client';

describe('Database Infrastructure', () => {
  beforeAll(async () => {
    try {
      // Test connection before running tests
      const client = await pool.connect();
      console.log('Successfully connected to database');
      await client.release();
    } catch (err) {
      console.error('Failed to connect to database:', err);
      throw err;
    }
  });

  afterAll(async () => {
    try {
      await pool.end();
      console.log('Pool has ended');
    } catch (err) {
      console.error('Error ending pool:', err);
    }
  });

  test('can connect to database', async () => {
    try {
      const result = await DatabaseClient.query('SELECT 1 as number');
      expect(result.rows[0].number).toBe(1);
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  }, 60000); // Increase individual test timeout
}); 