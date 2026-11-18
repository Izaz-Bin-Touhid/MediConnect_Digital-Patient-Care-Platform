// Centralizes the JWT validation previously performed in AuthModule.
export function validateEnvironment(config: Record<string, unknown>) {
  const secret = config.JWT_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }
  return config;
}
