import { secretsManager } from './secretsManager.js';
import { log } from '../vite.js';

export interface AppConfig {
  DATABASE_URL: string;
  GEMINI_API_KEY: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_CLIENT_SECRET?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  FIREBASE_SERVICE_ACCOUNT?: string;
  GCS_BUCKET_NAME?: string;
  NODE_ENV: string;
  PORT: string;
}

class ConfigLoader {
  private config: Partial<AppConfig> = {};
  private loaded = false;

  async loadConfig(): Promise<AppConfig> {
    if (this.loaded) {
      return this.config as AppConfig;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // In production, load from GCP Secrets Manager
      log('Loading configuration from GCP Secrets Manager...');
      
      const secrets = [
        { name: 'database-url', envVar: 'DATABASE_URL' },
        { name: 'gemini-api-key', envVar: 'GEMINI_API_KEY' },
        { name: 'jwt-secret', envVar: 'JWT_SECRET' },
        { name: 'google-client-id', envVar: 'GOOGLE_CLIENT_ID' },
        { name: 'google-client-secret', envVar: 'GOOGLE_CLIENT_SECRET' },
        { name: 'apple-client-id', envVar: 'APPLE_CLIENT_ID' },
        { name: 'apple-client-secret', envVar: 'APPLE_CLIENT_SECRET' },
        { name: 'linkedin-client-id', envVar: 'LINKEDIN_CLIENT_ID' },
        { name: 'linkedin-client-secret', envVar: 'LINKEDIN_CLIENT_SECRET' },
        { name: 'firebase-service-account', envVar: 'FIREBASE_SERVICE_ACCOUNT' },
        { name: 'gcs-bucket-name', envVar: 'GCS_BUCKET_NAME' },
      ];

      const secretValues = await secretsManager.getMultipleSecrets(secrets);
      
      // Merge with environment variables (secrets take precedence)
      this.config = {
        ...process.env,
        ...secretValues,
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || '5000',
      };
    } else {
      // In development, use environment variables directly
      log('Loading configuration from environment variables...');
      this.config = {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '5000',
      };
    }

    this.loaded = true;
    return this.config as AppConfig;
  }

  getConfig(): Partial<AppConfig> {
    if (!this.loaded) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  // Helper method to get a specific config value
  get<K extends keyof AppConfig>(key: K): AppConfig[K] | undefined {
    return this.config[key];
  }

  // Helper method to check if config is loaded
  isLoaded(): boolean {
    return this.loaded;
  }
}

export const configLoader = new ConfigLoader();
