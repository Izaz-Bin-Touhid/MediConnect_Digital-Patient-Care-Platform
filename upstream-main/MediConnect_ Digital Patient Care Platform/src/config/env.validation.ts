export function validateEnvironment(config: Record<string, unknown>) {
  const errors: string[] = [];

  for (const key of ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE', 'DB_PASSWORD']) {
    const value = config[key];
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${key} is required`);
    }
  }

  const port = config.PORT ?? '3000';
  const databasePort = config.DB_PORT;

  for (const [key, value] of [['PORT', port], ['DB_PORT', databasePort]]) {
    if (!/^\d+$/.test(String(value ?? '')) ||
        Number(value) < 1 || Number(value) > 65535) {
      errors.push(`${key} must be an integer between 1 and 65535`);
    }
  }

  const secret = config.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim().length < 32) {
    errors.push('JWT_SECRET must contain at least 32 non-padding characters');
  }

  if (errors.length) {
    // Report variable names and rules, never passwords or secret values.
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  return {
    ...config,
    PORT: Number(port),
    DB_PORT: Number(databasePort),
  };
}
