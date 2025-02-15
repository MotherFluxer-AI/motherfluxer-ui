import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  user: 'postgres',
  password: 'password',
  // Use localhost if NODE_ENV is test or if DB_HOST is not set
  host: process.env.NODE_ENV === 'test' || !process.env.DB_HOST 
    ? 'localhost' 
    : process.env.DB_HOST,
  port: 5432,
  database: 'motherfluxer',
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  max: 1
};

console.log('Database config:', {
  ...dbConfig,
  password: '[REDACTED]',
  host: dbConfig.host // Log the host we're using
});

const pool = new Pool(dbConfig);

// Add error logging
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Connected to database');
});

export { pool }; 