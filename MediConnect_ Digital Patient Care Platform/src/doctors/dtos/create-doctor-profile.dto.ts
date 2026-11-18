import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  qualification: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  specialization: string;

  @IsInt()
  @Min(0)
  experience_years: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registration_no: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  supporting_documents?: string[];

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  consultation_fee: number;
}