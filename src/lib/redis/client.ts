import { createClient } from 'redis';

class RedisClient {
  private static instance: ReturnType<typeof createClient>;

  static async connect() {
    if (!this.instance) {
      this.instance = createClient({
        url: process.env.REDIS_URL
      });
      await this.instance.connect();
    }
    return this.instance;
  }

  static async disconnect() {
    if (this.instance) {
      await this.instance.disconnect();
    }
  }
}

export { RedisClient }; 