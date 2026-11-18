import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

class AdminProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({ type: String, example: 'Dr. Nabila Hasan' })
  full_name: string;

  @IsEmail()
  @MaxLength(150)
  @ApiProperty({ type: String, example: 'doctor@example.com' })
  email: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  @ApiProperty({ type: String, example: '01812345678' })
  phone: string;
}

export class UpdateAdminDto extends PartialType(
  AdminProfileDto,
  { skipNullProperties: false },
) {}
