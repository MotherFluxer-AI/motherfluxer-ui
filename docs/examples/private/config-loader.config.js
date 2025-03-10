// src/config/config-loader.config.js

/**
 * @ai-context: AWS configuration loader for secure parameter management
 * @ai-dependencies: AWS Parameter Store, Secrets Manager
 * @ai-critical-points:
 * - Loads sensitive configuration from AWS services
 * - SSL certificate required for database connections
 * - JWT secrets must be set in process.env
 * 
 * LEARNING POINTS:
 * 1. Parameter Loading Order:
 *    Database credentials must load before connection initialization
 * 
 * 2. SSL Certificate:
 *    Required for PostgreSQL connections, loaded from specific path
 * 
 * 3. JWT Secrets:
 *    Two separate secrets for users and instances
 */

const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const fs = require('fs');

class ConfigLoader {
  constructor(region = 'us-east-2') {
    this.ssmClient = new SSMClient({ region });
    this.secretsClient = new SecretsManagerClient({ region });
    this.config = null;
    process.env.JWT_SECRET = null;
    process.env.INSTANCE_JWT_SECRET = null;
  }

  async getParameter(parameterName) {
    try {
      const command = new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true,
      });
      const response = await this.ssmClient.send(command);
      return response.Parameter.Value;
    } catch (error) {
      throw new Error(`Failed to fetch parameter ${parameterName}: ${error.message}`);
    }
  }

  async getSecret(secretId) {
    try {
      const command = new GetSecretValueCommand({ SecretId: secretId });
      const response = await this.secretsClient.send(command);
      return JSON.parse(response.SecretString);
    } catch (error) {
      throw new Error(`Failed to fetch secret ${secretId}: ${error.message}`);
    }
  }

  async loadConfig() {
    if (this.config) return this.config;

    const parameterPath = '/motherfluxer/auth/';
    
    try {
      // Load SSL certificate
      const sslCertPath = '/home/ec2-user/cx384412/certs/us-east-2-bundle.pem';
      const sslCertificate = fs.readFileSync(sslCertPath).toString();

      // Fetch all parameters in parallel
      const [
        dbSecretId,
        dbName,
        dbHost,
        redisHost,
        redisPort,
        jwtSecret,
        instanceSecret
      ] = await Promise.all([
        this.getParameter(`${parameterPath}db/secret-name`),
        this.getParameter(`${parameterPath}db/name`),
        this.getParameter(`${parameterPath}db/host`),
        this.getParameter(`${parameterPath}redis/host`),
        this.getParameter(`${parameterPath}redis/port`),
        this.getParameter(`${parameterPath}jwt/secret`),
        this.getParameter(`${parameterPath}jwt/instance-secret`)
      ]);

      const dbCredentials = await this.getSecret(dbSecretId);

      this.config = {
        postgres: {
          username: dbCredentials.username,
          password: dbCredentials.password,
          database: dbName,
          host: dbHost,
          dialect: 'postgres',
          schema: 'auth_service',
          ssl: true,
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: true,
              ca: sslCertificate
            }
          },
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
          }
        },
        redis: {
          host: redisHost,
          port: parseInt(redisPort),
          tls: true,
          socket: {
            tls: true,
            rejectUnauthorized: true
          }
        },
        jwt: {
          secret: jwtSecret,
          instanceSecret: instanceSecret,
          expiresIn: '24h',
          instanceExpiresIn: '30d'
        }
      };

      // Set JWT secrets in process.env
      process.env.JWT_SECRET = await this.getParameter(`${parameterPath}jwt/secret`);
      process.env.INSTANCE_JWT_SECRET = await this.getParameter(`${parameterPath}jwt/instance-secret`);
      
      this.validateConfig();
      return this.config;
    } catch (error) {
      throw new Error(`Configuration loading failed: ${error.message}`);
    }
  }

  validateConfig() {
    const required = {
      postgres: ['username', 'password', 'database', 'host', 'schema'],
      redis: ['host', 'port'],
      jwt: ['secret', 'instanceSecret']
    };

    for (const [section, fields] of Object.entries(required)) {
      for (const field of fields) {
        if (!this.config[section][field]) {
          throw new Error(`Missing required config: ${section}.${field}`);
        }
      }
    }

    // Validate specific fields
    if (typeof this.config.redis.port !== 'number') {
      throw new Error('Redis port must be a number');
    }

    // Validate SSL certificate
    if (!this.config.postgres.dialectOptions?.ssl?.ca) {
      throw new Error('Missing SSL certificate for PostgreSQL connection');
    }
  }
}

module.exports = new ConfigLoader();
