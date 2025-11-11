import { z } from 'zod';

/**
 * Environment variable validation schema
 * Ensures all required security and configuration variables are set
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().min(1, 'Database URL is required'),

  // Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),

  // Security
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'Encryption key must be 64 characters (32 bytes hex)')
    .regex(/^[0-9a-f]{64}$/i, 'Encryption key must be valid hex string')
    .optional()
    .default(() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY is required in production');
      }
      // Generate for development
      return require('crypto').randomBytes(32).toString('hex');
    }),

  // Optional but recommended
  SENTRY_DSN: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),

  // App configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validate environment variables on startup
 */
export function validateEnv(): void {
  try {
    envSchema.parse(process.env);
    console.log('✓ Environment variables validated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 */
export function getEnv<K extends keyof z.infer<typeof envSchema>>(
  key: K
): z.infer<typeof envSchema>[K] {
  const env = envSchema.parse(process.env);
  return env[key];
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Security checklist for production deployment
 */
export function checkProductionSecurity(): {
  passed: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check encryption key
  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY is not set');
  } else if (process.env.ENCRYPTION_KEY.length !== 64) {
    errors.push('ENCRYPTION_KEY must be 64 characters (32 bytes hex)');
  }

  // Check database URL is production-ready
  if (process.env.DATABASE_URL?.includes('localhost')) {
    warnings.push('DATABASE_URL appears to be localhost');
  }

  // Check Sentry is configured
  if (!process.env.SENTRY_DSN) {
    warnings.push('SENTRY_DSN not set - error tracking disabled');
  }

  // Check Stripe configuration
  if (!process.env.STRIPE_SECRET_KEY) {
    warnings.push('STRIPE_SECRET_KEY not set - payments disabled');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    warnings.push('STRIPE_WEBHOOK_SECRET not set - webhook verification disabled');
  }

  // Check storage configuration
  if (!process.env.R2_ACCESS_KEY_ID) {
    warnings.push('R2_ACCESS_KEY_ID not set - file uploads disabled');
  }

  // Check HTTPS
  if (process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://')) {
    errors.push('NEXT_PUBLIC_APP_URL must use HTTPS in production');
  }

  return {
    passed: errors.length === 0,
    warnings,
    errors,
  };
}
