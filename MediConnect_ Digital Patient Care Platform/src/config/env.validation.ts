export function validateEnvironment(config: Record<string, unknown>) {
  const errors: string[] = [];

  for (const key of ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE', 'DB_PASSWORD']) {
    const value = config[key];
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${key} is required`);
    }
  }

  const databaseSsl = config.DB_SSL ?? 'false';
  if (!['true', 'false'].includes(String(databaseSsl))) {
    errors.push('DB_SSL must be true or false');
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

  const mailEnabled = config.MAIL_ENABLED ?? 'false';
  if (!['true', 'false'].includes(String(mailEnabled))) {
    errors.push('MAIL_ENABLED must be true or false');
  }
  if (mailEnabled === 'true') {
    for (const key of ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASSWORD', 'MAIL_FROM']) {
      if (typeof config[key] !== 'string' || !(config[key] as string).trim()) {
        errors.push(`${key} is required when mail is enabled`);
      }
    }
    if (!/^\d+$/.test(String(config.MAIL_PORT ?? '')) ||
        Number(config.MAIL_PORT) < 1 || Number(config.MAIL_PORT) > 65535) {
      errors.push('MAIL_PORT must be an integer between 1 and 65535');
    }
  }

  if (errors.length) {
    // Report variable names and rules, never passwords or secret values.
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  return {
    ...config,
    MAIL_ENABLED: mailEnabled,
    DB_SSL: databaseSsl,
    PORT: Number(port),
    DB_PORT: Number(databasePort),
  };
}
