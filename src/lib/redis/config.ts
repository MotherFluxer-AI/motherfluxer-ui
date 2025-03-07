import { createClient, RedisClientType } from 'redis';

const redisConfig = {
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: true
  }
};

class RedisClient {
  private static instance: RedisClientType;
  private static isConnecting: boolean = false;

  static async getInstance(): Promise<RedisClientType> {
    if (!this.instance && !this.isConnecting) {
      this.isConnecting = true;
      this.instance = createClient(redisConfig);

      this.instance.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.instance.connect();
      this.isConnecting = false;
    }

    return this.instance;
  }
}

export default RedisClient; 