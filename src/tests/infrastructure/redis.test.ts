import { RedisClient } from '@/lib/redis/client';

describe('Redis Infrastructure', () => {
  test('can connect to Redis', async () => {
    const client = await RedisClient.connect();
    expect(client.isReady).toBe(true);
  });
}); 