import { log } from "./vite.js";
import { configLoader } from "./services/configLoader.js";

export async function validateEnvironment() {
  // Load configuration first
  const config = await configLoader.loadConfig();
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'GEMINI_API_KEY',
    'JWT_SECRET',
  ];

  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!config[envVar as keyof typeof config]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    const error = `Missing required environment variables: ${missingVars.join(', ')}`;
    log(`Environment validation failed: ${error}`);
    throw new Error(error);
  }

  log("Environment validation passed");
  log(`Configuration loaded from: ${config.NODE_ENV === 'production' ? 'GCP Secrets Manager' : 'Environment Variables'}`);
}