import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { AuthRole } from '../auth.types.js';

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsIn(['admin', 'coordinator', 'doctor', 'diagnostic_center', 'patient'])
  role?: AuthRole;
}
