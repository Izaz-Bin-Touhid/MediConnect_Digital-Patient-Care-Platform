import { SetMetadata } from '@nestjs/common';
import type { AuthRole } from '../../auth/auth.types.js';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles);
