declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_WS_URL: string;
    REDIS_URL: string;
    DB_HOST: string;
    DATABASE_URL: string;
  }
} 