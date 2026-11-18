import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
  IsString,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

export class CreateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @ApiProperty({ type: String, example: 'MBBS, FCPS' })
  qualification: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ type: String, example: 'Medicine' })
  specialization: string;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  @ApiProperty({ type: Number, example: 4 })
  experience_years: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ type: String, example: 'DEMO-2026-001' })
  registration_no: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  @ApiPropertyOptional({ type: [String], example: ['certificate.pdf'], description: 'Document file references; this endpoint does not upload files' })
  supporting_documents?: string[];

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(99999999.99)
  @ApiProperty({ type: Number, example: 700 })
  consultation_fee: number;
}