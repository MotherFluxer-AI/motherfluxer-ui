import { Pool, PoolConfig } from 'pg';

const isTest = process.env.NODE_ENV === 'test';

const dbConfig: PoolConfig = {
  user: 'postgres',
  password: 'password',
  // Force localhost in test environment
  host: isTest ? 'localhost' : (process.env.DB_HOST || 'localhost'),
  port: 5432,
  database: 'motherfluxer',
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  max: 1
};

console.log('Database config:', {
  ...dbConfig,
  password: '[REDACTED]' // Don't log the password
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