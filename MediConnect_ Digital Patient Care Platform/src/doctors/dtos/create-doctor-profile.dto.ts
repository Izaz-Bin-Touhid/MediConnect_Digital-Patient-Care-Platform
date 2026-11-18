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
  qualification: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  specialization: string;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  experience_years: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registration_no: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  supporting_documents?: string[];

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(99999999.99)
  consultation_fee: number;
}