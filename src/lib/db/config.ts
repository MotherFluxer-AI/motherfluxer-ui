import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: 5432,
  ssl: true,
  max: 5,
  min: 0,
  idleTimeoutMillis: 10000,
};

export const pool = new Pool(dbConfig);

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
}); 