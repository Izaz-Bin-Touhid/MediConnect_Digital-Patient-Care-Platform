import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

class AdminProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  full_name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone: string;
}

export class UpdateAdminDto extends PartialType(
  AdminProfileDto,
  { skipNullProperties: false },
) {}
