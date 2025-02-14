import { DatabaseClient } from '../client';
import { User } from '../types';

export class UserRepository {
  static async findById(id: string): Promise<User | null> {
    const result = await DatabaseClient.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await DatabaseClient.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async create(user: Omit<User, 'id' | 'created_at' | 'last_login'>): Promise<User> {
    const result = await DatabaseClient.query<User>(
      `INSERT INTO users (
        email, hashed_password, role, is_active, request_limit
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [user.email, user.hashed_password, user.role, user.is_active, user.request_limit]
    );
    return result.rows[0];
  }

  static async updateLastLogin(id: string): Promise<void> {
    await DatabaseClient.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }
} 