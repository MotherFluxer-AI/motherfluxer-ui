import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  user: 'postgres',
  password: 'password',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  database: 'motherfluxer',
  idleTimeoutMillis: 10000,
};

export const pool = new Pool(dbConfig);

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
}); 