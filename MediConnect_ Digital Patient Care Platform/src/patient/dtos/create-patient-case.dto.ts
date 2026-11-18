import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientCaseDto {
  @ApiProperty({ example: 'C-1001', minLength: 5, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  caseId: string;

  @ApiProperty({ example: 'MC-2026-001', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  caseCode: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  doctorId: number;

  @ApiProperty({ example: 'Persistent headache and dizziness', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  symptoms: string;

  @ApiProperty({ example: '3 days', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  duration: string;

  @ApiProperty({ example: 32, minimum: 0, maximum: 120 })
  @IsInt()
  @Min(0)
  @Max(120)
  age: number;

  @ApiProperty({ example: 'Female', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  gender: string;

  @ApiPropertyOptional({ example: 'Migraine', nullable: true, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  previousIllness?: string | null;

  @ApiPropertyOptional({
    example: 'Headache worsens in the evening',
    nullable: true,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;
}
