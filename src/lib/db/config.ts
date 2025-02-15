import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  user: 'postgres',
  password: 'password',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  database: 'motherfluxer',
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  max: 1
};

const pool = new Pool(dbConfig);

// Add error logging
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Connected to database');
});

export { pool }; 