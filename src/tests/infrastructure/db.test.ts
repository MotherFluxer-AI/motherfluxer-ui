import { DatabaseClient, pool } from '@/lib/db/client';

describe('Database Infrastructure', () => {
  // Increase timeout and add cleanup
  jest.setTimeout(30000);

  // Cleanup after all tests
  afterAll(async () => {
    await pool.end();
  });

  test('can connect to database', async () => {
    const result = await DatabaseClient.query('SELECT 1 as number');
    expect(result.rows[0].number).toBe(1);
  });
}); 