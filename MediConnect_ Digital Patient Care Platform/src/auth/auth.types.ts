export type AuthRole =
  'admin' | 'coordinator' | 'doctor' | 'diagnostic_center' | 'patient';

export interface AuthActor {
  sub: string;
  role: AuthRole;
  tokenVersion?: number;
}

export interface AuthRequest {
  headers: { authorization?: string };
  actor?: AuthActor;
}
