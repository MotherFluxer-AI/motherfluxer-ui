describe('Environment Variables', () => {
  test('required env variables are set', () => {
    expect(process.env.NEXT_PUBLIC_API_URL).toBeDefined();
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.REDIS_URL).toBeDefined();
  });
}); 