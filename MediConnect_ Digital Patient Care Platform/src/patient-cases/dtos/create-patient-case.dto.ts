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

export class CreatePatientCaseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  caseId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  caseCode: string;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  doctorId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  symptoms: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  duration: string;

  @IsInt()
  @Min(0)
  @Max(120)
  age: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  gender: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  previousIllness?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;
}
