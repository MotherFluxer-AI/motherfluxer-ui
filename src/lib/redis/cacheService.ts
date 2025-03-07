import RedisClient from './config';
import { ModelInstance } from '../db/types';

const CACHE_TTL = 3600; // 1 hour in seconds

export class CacheService {
  static async getClient() {
    return await RedisClient.getInstance();
  }

  // Session Management
  static async setSession(sessionId: string, userData: any): Promise<void> {
    const client = await this.getClient();
    await client.set(`session:${sessionId}`, JSON.stringify(userData), {
      EX: CACHE_TTL
    });
  }

  static async getSession(sessionId: string): Promise<any | null> {
    const client = await this.getClient();
    const data = await client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  // Rate Limiting
  static async incrementRateLimit(userId: string): Promise<number> {
    const client = await this.getClient();
    const key = `ratelimit:${userId}`;
    const count = await client.incr(key);
    
    // Set expiry on first increment
    if (count === 1) {
      await client.expire(key, CACHE_TTL);
    }
    
    return count;
  }

  // Instance Health States
  static async setInstanceHealth(instanceId: string, health: number): Promise<void> {
    const client = await this.getClient();
    await client.set(`health:${instanceId}`, health.toString(), {
      EX: 300 // 5 minutes TTL for health status
    });
  }

  static async getInstanceHealth(instanceId: string): Promise<number | null> {
    const client = await this.getClient();
    const health = await client.get(`health:${instanceId}`);
    return health ? parseInt(health) : null;
  }

  // Routing Decisions Cache
  static async cacheRoutingDecision(userId: string, instance: ModelInstance): Promise<void> {
    const client = await this.getClient();
    await client.set(`route:${userId}`, JSON.stringify(instance), {
      EX: 60 // 1 minute TTL for routing decisions
    });
  }

  static async getRoutingDecision(userId: string): Promise<ModelInstance | null> {
    const client = await this.getClient();
    const data = await client.get(`route:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  // Performance Metrics
  static async recordLatency(operation: string, latency: number): Promise<void> {
    const client = await this.getClient();
    const key = `metrics:latency:${operation}`;
    await client.zAdd(key, [{
      score: Date.now(),
      value: latency.toString()
    }]);
    // Keep only last hour of metrics
    await client.zRemRangeByScore(key, 0, Date.now() - 3600000);
  }
} 