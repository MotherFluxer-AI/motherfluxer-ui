import { DatabaseClient } from '../client';
import { ModelInstance } from '../types';

export class ModelInstanceRepository {
  static async findById(id: string): Promise<ModelInstance | null> {
    const result = await DatabaseClient.query<ModelInstance>(
      'SELECT * FROM model_instances WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findActive(): Promise<ModelInstance[]> {
    const result = await DatabaseClient.query<ModelInstance>(
      'SELECT * FROM model_instances WHERE is_active = true ORDER BY health_score DESC'
    );
    return result.rows;
  }

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

  static async updateHealth(id: string, healthScore: number): Promise<void> {
    await DatabaseClient.query(
      `UPDATE model_instances 
       SET health_score = $2, last_health_check = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id, healthScore]
    );
  }
} 