import { DatabaseClient } from '@/lib/db/client';

describe('Database Infrastructure', () => {
  test('can connect to database', async () => {
    const result = await DatabaseClient.query('SELECT 1');
    expect(result.rows).toBeDefined();
  });
}); 