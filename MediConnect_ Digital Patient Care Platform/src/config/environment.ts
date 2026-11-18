export function validateEnvironment(env: Record<string, unknown>) {
  const port = (name: string, fallback: number) => {
    const value = Number(env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      throw new Error(`${name} must be a port between 1 and 65535`);
    }
    return value;
  };
  const jwtSecret = env.JWT_SECRET;
  if (
    jwtSecret &&
    (typeof jwtSecret !== 'string' || Buffer.byteLength(jwtSecret) < 32)
  ) {
    throw new Error('JWT_SECRET must be at least 32 bytes');
  }

  return { ...env, PORT: port('PORT', 3000), DB_PORT: port('DB_PORT', 5432) };
}
