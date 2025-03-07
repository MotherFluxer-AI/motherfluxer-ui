import { ApiClient } from '@/lib/api/client';

describe('API Infrastructure', () => {
  test('can connect to API endpoint', async () => {
    const response = await ApiClient.getInstances('test-model');
    expect(response.status).toBeDefined();
  });
}); 