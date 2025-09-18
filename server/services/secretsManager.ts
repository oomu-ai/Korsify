import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export class SecretsManager {
  private client: SecretManagerServiceClient;
  private projectId: string;
  private cache: Map<string, { value: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'korsify-app';
  }

  async getSecret(secretName: string, version: string = 'latest'): Promise<string> {
    // Check cache first
    const cacheKey = `${secretName}:${version}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.value;
    }

    try {
      const [version] = await this.client.accessSecretVersion({
        name: `projects/${this.projectId}/secrets/${secretName}/versions/${version}`,
      });

      const secretValue = version.payload?.data?.toString();
      
      if (!secretValue) {
        throw new Error(`Secret ${secretName} is empty or not found`);
      }

      // Cache the secret
      this.cache.set(cacheKey, {
        value: secretValue,
        timestamp: Date.now()
      });

      return secretValue;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      throw new Error(`Failed to retrieve secret ${secretName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMultipleSecrets(secrets: { name: string; envVar: string; version?: string }[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    // Try to get all secrets in parallel
    const promises = secrets.map(async ({ name, envVar, version = 'latest' }) => {
      try {
        const value = await this.getSecret(name, version);
        results[envVar] = value;
      } catch (error) {
        console.error(`Failed to load secret ${name} for ${envVar}:`, error);
        // Don't throw here, let the app continue with undefined values
        // The env-check will catch missing required variables
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  // Clear cache (useful for testing or when secrets are updated)
  clearCache(): void {
    this.cache.clear();
  }
}

export const secretsManager = new SecretsManager();
