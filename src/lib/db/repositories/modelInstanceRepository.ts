/**
 * @ai-context: Manages database operations for model instances
 * @ai-dependencies: DatabaseClient, ModelInstance type
 * @ai-critical-points: Must maintain data consistency and handle connection failures
 *
 * LEARNING POINTS:
 * 1. Implements repository pattern for model instance management
 * 2. Uses parameterized queries for security
 */

import { DatabaseClient } from '../client';
import { ModelInstance } from '@/lib/api/types';

export class ModelInstanceRepository {
  /**
   * @ai-function: Retrieves a single model instance by its ID
   * @ai-requires: Valid UUID for instance identification
   * @ai-affects: Database read operations
   */
  static async findById(id: string): Promise<ModelInstance | null> {
    const result = await DatabaseClient.query<ModelInstance>(
      'SELECT * FROM model_instances WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * @ai-function: Retrieves all active model instances ordered by health
   * @ai-requires: None
   * @ai-affects: Load balancing and instance selection
   */
  static async findActive(): Promise<ModelInstance[]> {
    const result = await DatabaseClient.query<ModelInstance>(
      'SELECT * FROM model_instances WHERE is_active = true ORDER BY health_score DESC'
    );
    return result.rows;
  }

  /**
   * @ai-function: Creates a new model instance record
   * @ai-requires: Valid instance data excluding auto-generated fields
   * @ai-affects: Instance availability and system capacity
   */
  static async create(instance: Omit<ModelInstance, 'id' | 'registered_at' | 'last_health_check'>): Promise<ModelInstance> {
    const result = await DatabaseClient.query<ModelInstance>(
      `INSERT INTO model_instances (
        admin_id, instance_name, host_address, health_score, 
        is_active, version, container_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        instance.admin_id,
        instance.instance_name,
        instance.host_address,
        instance.health_score,
        instance.is_active,
        instance.version,
        instance.container_version
      ]
    );
    return result.rows[0];
  }

  /**
   * @ai-function: Updates instance health score and check timestamp
   * @ai-requires: Valid instance ID and health score
   * @ai-affects: Load balancing and failover decisions
   */
  static async updateHealth(id: string, healthScore: number): Promise<void> {
    await DatabaseClient.query(
      `UPDATE model_instances 
       SET health_score = $2, last_health_check = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id, healthScore]
    );
  }
} 